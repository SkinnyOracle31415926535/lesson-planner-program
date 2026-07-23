export type CustomStationSpot = {
  id: string;
  name: string;
  /** Normalized against the uncropped source photo. */
  x: number;
  y: number;
};

/** Metadata only. Photos themselves stay in IndexedDB as local Blobs. */
export const CUSTOM_BOARD_STORAGE_VERSION = 1;

/**
 * A photo-area image can be made a little smaller or larger without moving
 * its normalized station spots or lesson labels. Older saved boards omit the
 * field and therefore render at the default scale.
 */
export const CUSTOM_BOARD_PHOTO_SCALE = {
  default: 1,
  minimum: 0.5,
  maximum: 2,
  step: 0.1,
} as const;

/** Source photos at or above this ratio use the roomier wide panel layout. */
export const CUSTOM_BOARD_WIDE_ASPECT_RATIO = 1.35;

/**
 * Callout labels are positioned relative to the photo: 0–1 is inside the
 * photo and this small outer gutter lets a coach keep labels around it.
 */
export const CUSTOM_CALLOUT_BOUNDS = {
  minX: -0.32,
  maxX: 1.32,
  minY: -0.24,
  maxY: 1.24,
} as const;

export type CustomBoard = {
  id: string;
  title: string;
  /** Optional short event label, e.g. "Bars" or "Floor". Older local boards omit it. */
  eventName?: string;
  photoId: string;
  filename: string;
  width: number;
  height: number;
  /** Optional for compatibility with photo areas saved before resize support. */
  photoScale?: number;
  spots: CustomStationSpot[];
  createdAt: string;
  updatedAt: string;
};

export type VisualLabelLayout = {
  placement: "spot" | "callout";
  /**
   * Relative to the uncropped photo. Callouts may use the small outer gutter
   * in CUSTOM_CALLOUT_BOUNDS so their text can surround the picture.
   */
  x: number;
  y: number;
  route: "straight" | "one-turn";
};

export type NormalizedPoint = { x: number; y: number };
export type NormalizedLabelBox = { left: number; top: number; width: number; height: number };

/** The geometry needed to lay out one short lesson label on a custom photo. */
export type CustomLabelGeometry = {
  id: string;
  spot: NormalizedPoint;
  layout: VisualLabelLayout;
  box: NormalizedLabelBox;
};

export type CustomLabelLayoutConflict = {
  kind: "label-overlap" | "leader-crosses-label" | "leader-crosses-leader";
  withId: string;
};

export type LabelLayoutValidation = {
  isValid: boolean;
  conflicts: CustomLabelLayoutConflict[];
};

export type SegmentConflictOptions = {
  /** A shared endpoint is usually readable; set true when any touch should block a drag. */
  endpointTouchCounts?: boolean;
  epsilon?: number;
};

export type CustomBoardStorage = {
  version: typeof CUSTOM_BOARD_STORAGE_VERSION;
  boards: CustomBoard[];
};

export type CustomStationSpotPatch = Partial<Pick<CustomStationSpot, "name" | "x" | "y">>;

export type StoredAreaPhoto = {
  id: string;
  blob: Blob;
  filename: string;
  mimeType: string;
  width: number;
  height: number;
  createdAt: string;
};

const PHOTO_DATABASE_NAME = "gym-lesson-planner-local-media";
const PHOTO_STORE_NAME = "areaPhotos";
const PHOTO_DATABASE_VERSION = 1;

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Local photo storage request failed."));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error("Local photo storage transaction stopped."));
    transaction.onerror = () => reject(transaction.error ?? new Error("Local photo storage transaction failed."));
  });
}

async function photoDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") throw new Error("This browser does not support private local photo storage.");
  const request = indexedDB.open(PHOTO_DATABASE_NAME, PHOTO_DATABASE_VERSION);
  request.onupgradeneeded = () => {
    if (!request.result.objectStoreNames.contains(PHOTO_STORE_NAME)) {
      request.result.createObjectStore(PHOTO_STORE_NAME, { keyPath: "id" });
    }
  };
  return requestResult(request);
}

export async function saveCustomBoardPhoto(photo: StoredAreaPhoto): Promise<void> {
  const database = await photoDatabase();
  try {
    const transaction = database.transaction(PHOTO_STORE_NAME, "readwrite");
    transaction.objectStore(PHOTO_STORE_NAME).put(photo);
    await transactionDone(transaction);
  } finally {
    database.close();
  }
}

export async function loadCustomBoardPhoto(photoId: string): Promise<StoredAreaPhoto | null> {
  const database = await photoDatabase();
  try {
    const transaction = database.transaction(PHOTO_STORE_NAME, "readonly");
    const photo = await requestResult(transaction.objectStore(PHOTO_STORE_NAME).get(photoId));
    await transactionDone(transaction);
    return (photo as StoredAreaPhoto | undefined) ?? null;
  } finally {
    database.close();
  }
}

export async function removeCustomBoardPhoto(photoId: string): Promise<void> {
  const database = await photoDatabase();
  try {
    const transaction = database.transaction(PHOTO_STORE_NAME, "readwrite");
    transaction.objectStore(PHOTO_STORE_NAME).delete(photoId);
    await transactionDone(transaction);
  } finally {
    database.close();
  }
}

export function clampUnit(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

function clampRange(value: number, minimum: number, maximum: number): number {
  return Number.isFinite(value) ? Math.min(maximum, Math.max(minimum, value)) : 0;
}

/** Resolves legacy boards to their normal (100%) photo display size. */
export function customBoardPhotoScale(board: Pick<CustomBoard, "photoScale">): number {
  return board.photoScale === undefined ? CUSTOM_BOARD_PHOTO_SCALE.default : clampCustomBoardPhotoScale(board.photoScale);
}

/**
 * Resolves the presentational facts for a saved photo area without changing
 * its normalized station or label coordinates. The source photo determines
 * whether the default panel is wide; the coach's +/- scale can additionally
 * make any panel span its row.
 */
export function customBoardPhotoPanelLayout(
  board: Pick<CustomBoard, "width" | "height" | "photoScale">,
): { sourceAspectRatio: number; scale: number; isWide: boolean; shouldSpanRow: boolean } {
  const sourceAspectRatio = Number.isFinite(board.width)
    && Number.isFinite(board.height)
    && board.width > 0
    && board.height > 0
    ? board.width / board.height
    : 1;
  const scale = customBoardPhotoScale(board);
  const isWide = sourceAspectRatio >= CUSTOM_BOARD_WIDE_ASPECT_RATIO;
  return {
    sourceAspectRatio,
    scale,
    isWide,
    shouldSpanRow: isWide || scale > CUSTOM_BOARD_PHOTO_SCALE.default,
  };
}

/** Keeps a saved photo scale within the simple +/- control's safe range. */
export function clampCustomBoardPhotoScale(value: number): number {
  if (!Number.isFinite(value)) return CUSTOM_BOARD_PHOTO_SCALE.default;
  return Math.min(CUSTOM_BOARD_PHOTO_SCALE.maximum, Math.max(CUSTOM_BOARD_PHOTO_SCALE.minimum, value));
}

/** Returns the next larger display size without floating-point step drift. */
export function incrementCustomBoardPhotoScale(value: number): number {
  const next = clampCustomBoardPhotoScale(value) + CUSTOM_BOARD_PHOTO_SCALE.step;
  return clampCustomBoardPhotoScale(Number(next.toFixed(2)));
}

/** Returns the next smaller display size without floating-point step drift. */
export function decrementCustomBoardPhotoScale(value: number): number {
  const next = clampCustomBoardPhotoScale(value) - CUSTOM_BOARD_PHOTO_SCALE.step;
  return clampCustomBoardPhotoScale(Number(next.toFixed(2)));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function cleanSpotName(value: string, fallback: string): string {
  return value.trim().replace(/\s+/g, " ") || fallback;
}

function isFiniteUnit(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

function isCustomBoardPhotoScale(value: unknown): value is number {
  return typeof value === "number"
    && Number.isFinite(value)
    && value >= CUSTOM_BOARD_PHOTO_SCALE.minimum
    && value <= CUSTOM_BOARD_PHOTO_SCALE.maximum;
}

export function isCustomStationSpot(value: unknown): value is CustomStationSpot {
  return isRecord(value)
    && typeof value.id === "string" && value.id.trim().length > 0
    && typeof value.name === "string" && value.name.trim().length > 0
    && isFiniteUnit(value.x)
    && isFiniteUnit(value.y);
}

export function isCustomBoard(value: unknown): value is CustomBoard {
  return isRecord(value)
    && typeof value.id === "string" && value.id.trim().length > 0
    && typeof value.title === "string" && value.title.trim().length > 0
    && (value.eventName === undefined || typeof value.eventName === "string")
    && typeof value.photoId === "string" && value.photoId.trim().length > 0
    && typeof value.filename === "string" && value.filename.trim().length > 0
    && typeof value.width === "number" && Number.isFinite(value.width) && value.width > 0
    && typeof value.height === "number" && Number.isFinite(value.height) && value.height > 0
    && (value.photoScale === undefined || isCustomBoardPhotoScale(value.photoScale))
    && Array.isArray(value.spots) && value.spots.every(isCustomStationSpot)
    && new Set(value.spots.map((spot) => spot.id)).size === value.spots.length
    && typeof value.createdAt === "string" && value.createdAt.length > 0
    && typeof value.updatedAt === "string" && value.updatedAt.length > 0;
}

export function isCustomBoardStorage(value: unknown): value is CustomBoardStorage {
  return isRecord(value)
    && value.version === CUSTOM_BOARD_STORAGE_VERSION
    && Array.isArray(value.boards)
    && value.boards.every(isCustomBoard)
    && new Set(value.boards.map((board) => board.id)).size === value.boards.length;
}

/** Copies only the small, serializable metadata record stored in localStorage. */
export function customBoardStorage(boards: CustomBoard[]): CustomBoardStorage {
  return {
    version: CUSTOM_BOARD_STORAGE_VERSION,
    boards: boards.map((board) => ({ ...board, spots: board.spots.map((spot) => ({ ...spot })) })),
  };
}

export function normalizedCustomStationSpot(
  spot: CustomStationSpot,
  fallbackName = "Station spot",
): CustomStationSpot {
  return {
    id: spot.id.trim(),
    name: cleanSpotName(spot.name, fallbackName),
    x: clampUnit(spot.x),
    y: clampUnit(spot.y),
  };
}

function revisedBoard(board: CustomBoard, spots: CustomStationSpot[], updatedAt?: string): CustomBoard {
  return { ...board, spots, updatedAt: updatedAt ?? board.updatedAt };
}

/** Adds a station without mutating the saved board. Duplicate IDs are ignored. */
export function addCustomStationSpot(
  board: CustomBoard,
  spot: CustomStationSpot,
  updatedAt?: string,
): CustomBoard {
  const nextSpot = normalizedCustomStationSpot(spot, `Station ${board.spots.length + 1}`);
  if (!nextSpot.id || board.spots.some((existing) => existing.id === nextSpot.id)) return board;
  return revisedBoard(board, [...board.spots, nextSpot], updatedAt);
}

/** Renames or moves one existing station; coordinates always remain on the photo. */
export function updateCustomStationSpot(
  board: CustomBoard,
  spotId: string,
  patch: CustomStationSpotPatch,
  updatedAt?: string,
): CustomBoard {
  const current = board.spots.find((spot) => spot.id === spotId);
  if (!current) return board;
  const next = normalizedCustomStationSpot({
    id: current.id,
    name: patch.name ?? current.name,
    x: patch.x ?? current.x,
    y: patch.y ?? current.y,
  }, current.name);
  if (next.name === current.name && next.x === current.x && next.y === current.y) return board;
  return revisedBoard(board, board.spots.map((spot) => (spot.id === spotId ? next : spot)), updatedAt);
}

/** Removing a spot leaves the lesson card intact; the UI can ask for reassignment. */
export function removeCustomStationSpot(board: CustomBoard, spotId: string, updatedAt?: string): CustomBoard {
  if (!board.spots.some((spot) => spot.id === spotId)) return board;
  return revisedBoard(board, board.spots.filter((spot) => spot.id !== spotId), updatedAt);
}

export function renameCustomBoard(board: CustomBoard, title: string, updatedAt?: string): CustomBoard {
  const nextTitle = cleanSpotName(title, board.title);
  return nextTitle === board.title ? board : { ...board, title: nextTitle, updatedAt: updatedAt ?? board.updatedAt };
}

/** Keeps an optional short event label separate from the more specific area name. */
export function renameCustomBoardEvent(board: CustomBoard, eventName: string, updatedAt?: string): CustomBoard {
  const nextEventName = eventName.trim().replace(/\s+/g, " ");
  const previousEventName = board.eventName ?? "";
  if (nextEventName === previousEventName) return board;
  return {
    ...board,
    ...(nextEventName ? { eventName: nextEventName } : { eventName: undefined }),
    updatedAt: updatedAt ?? board.updatedAt,
  };
}

/** Saves one photo-area display scale without touching its image metadata or station spots. */
export function setCustomBoardPhotoScale(
  board: CustomBoard,
  photoScale: number,
  updatedAt?: string,
): CustomBoard {
  const nextPhotoScale = clampCustomBoardPhotoScale(photoScale);
  if (board.photoScale !== undefined && nextPhotoScale === board.photoScale) return board;
  return {
    ...board,
    photoScale: nextPhotoScale,
    updatedAt: updatedAt ?? board.updatedAt,
  };
}

/**
 * Keeps a photo area's identity, spots, and event label stable when its local
 * source image is replaced. Each replacement receives a new photo ID so an
 * older lesson snapshot can keep referencing its prior IndexedDB Blob.
 */
export function replaceCustomBoardPhotoMetadata(
  board: CustomBoard,
  photo: Pick<CustomBoard, "photoId" | "filename" | "width" | "height">,
  updatedAt?: string,
): CustomBoard {
  const photoId = photo.photoId.trim() || board.photoId;
  const filename = photo.filename.trim() || board.filename;
  const width = Number.isFinite(photo.width) && photo.width > 0 ? photo.width : board.width;
  const height = Number.isFinite(photo.height) && photo.height > 0 ? photo.height : board.height;
  return {
    ...board,
    photoId,
    filename,
    width,
    height,
    updatedAt: updatedAt ?? board.updatedAt,
  };
}

export function clampVisualLabelPosition(
  placement: VisualLabelLayout["placement"],
  point: NormalizedPoint,
): NormalizedPoint {
  if (placement === "spot") return { x: clampUnit(point.x), y: clampUnit(point.y) };
  return {
    x: clampRange(point.x, CUSTOM_CALLOUT_BOUNDS.minX, CUSTOM_CALLOUT_BOUNDS.maxX),
    y: clampRange(point.y, CUSTOM_CALLOUT_BOUNDS.minY, CUSTOM_CALLOUT_BOUNDS.maxY),
  };
}

export function isVisualLabelLayout(value: unknown): value is VisualLabelLayout {
  if (!isRecord(value) || (value.placement !== "spot" && value.placement !== "callout")) return false;
  if ((value.route !== "straight" && value.route !== "one-turn") || !Number.isFinite(value.x) || !Number.isFinite(value.y)) return false;
  const point = clampVisualLabelPosition(value.placement, { x: value.x as number, y: value.y as number });
  return point.x === value.x && point.y === value.y;
}

export function labelBoxAt(
  x: number,
  y: number,
  width: number,
  height: number,
): NormalizedLabelBox {
  return { left: x - width / 2, top: y - height / 2, width, height };
}

export function boxesOverlap(first: NormalizedLabelBox, second: NormalizedLabelBox, gap = 0.012): boolean {
  return first.left < second.left + second.width + gap
    && first.left + first.width + gap > second.left
    && first.top < second.top + second.height + gap
    && first.top + first.height + gap > second.top;
}

export function customLabelGeometry(
  id: string,
  spot: NormalizedPoint,
  layout: VisualLabelLayout,
  width: number,
  height: number,
): CustomLabelGeometry {
  return {
    id,
    spot,
    layout,
    box: labelBoxAt(layout.x, layout.y, width, height),
  };
}

function nearestPointOnBox(point: NormalizedPoint, box: NormalizedLabelBox): NormalizedPoint {
  const right = box.left + box.width;
  const bottom = box.top + box.height;
  if (point.x > box.left && point.x < right && point.y > box.top && point.y < bottom) {
    const candidates: NormalizedPoint[] = [
      { x: box.left, y: point.y },
      { x: right, y: point.y },
      { x: point.x, y: box.top },
      { x: point.x, y: bottom },
    ];
    return candidates.reduce((nearest, candidate) => {
      const nearestDistance = Math.hypot(nearest.x - point.x, nearest.y - point.y);
      const candidateDistance = Math.hypot(candidate.x - point.x, candidate.y - point.y);
      return candidateDistance < nearestDistance ? candidate : nearest;
    });
  }
  return {
    x: Math.min(right, Math.max(box.left, point.x)),
    y: Math.min(bottom, Math.max(box.top, point.y)),
  };
}

function samePoint(first: NormalizedPoint, second: NormalizedPoint, epsilon = 0.000001): boolean {
  return Math.abs(first.x - second.x) <= epsilon && Math.abs(first.y - second.y) <= epsilon;
}

/** Drops zero-length segments so a label drag cannot create a phantom conflict. */
export function normalizeLeaderPath(points: NormalizedPoint[]): NormalizedPoint[] {
  return points.reduce<NormalizedPoint[]>((normalized, point) => {
    if (!normalized.length || !samePoint(normalized[normalized.length - 1], point)) normalized.push(point);
    return normalized;
  }, []);
}

/**
 * Returns one direct leader or one elbow. The final point touches the nearest
 * edge of the text box, never its center, so the label stays readable.
 */
export function customBoardLeaderPath(
  spot: NormalizedPoint,
  layout: VisualLabelLayout,
  box: NormalizedLabelBox,
): NormalizedPoint[] {
  const labelEdge = nearestPointOnBox(spot, box);
  if (layout.route === "straight") {
    return normalizeLeaderPath([spot, labelEdge]);
  }
  const horizontalFirst = Math.abs(labelEdge.x - spot.x) >= Math.abs(labelEdge.y - spot.y);
  const bend = horizontalFirst
    ? { x: labelEdge.x, y: spot.y }
    : { x: spot.x, y: labelEdge.y };
  return normalizeLeaderPath([spot, bend, labelEdge]);
}

/** A label sitting directly on its station spot intentionally has no leader. */
export function visualLabelLeaderPath(geometry: CustomLabelGeometry): NormalizedPoint[] {
  return geometry.layout.placement === "spot"
    ? []
    : customBoardLeaderPath(geometry.spot, geometry.layout, geometry.box);
}

export function pointsAttribute(points: NormalizedPoint[]): string {
  return points.map((point) => `${point.x * 100},${point.y * 100}`).join(" ");
}

function cross(first: NormalizedPoint, second: NormalizedPoint): number {
  return first.x * second.y - first.y * second.x;
}

function subtract(first: NormalizedPoint, second: NormalizedPoint): NormalizedPoint {
  return { x: first.x - second.x, y: first.y - second.y };
}

function pointOnSegment(
  point: NormalizedPoint,
  start: NormalizedPoint,
  end: NormalizedPoint,
  epsilon: number,
): boolean {
  const vector = subtract(end, start);
  const fromStart = subtract(point, start);
  if (Math.abs(cross(vector, fromStart)) > epsilon) return false;
  return point.x >= Math.min(start.x, end.x) - epsilon
    && point.x <= Math.max(start.x, end.x) + epsilon
    && point.y >= Math.min(start.y, end.y) - epsilon
    && point.y <= Math.max(start.y, end.y) + epsilon;
}

/** True for a crossing, T-junction, or shared visible leader segment. */
export function customBoardSegmentsConflict(
  firstStart: NormalizedPoint,
  firstEnd: NormalizedPoint,
  secondStart: NormalizedPoint,
  secondEnd: NormalizedPoint,
  options: SegmentConflictOptions = {},
): boolean {
  const epsilon = options.epsilon ?? 0.000001;
  const endpointTouchCounts = options.endpointTouchCounts ?? false;
  const firstVector = subtract(firstEnd, firstStart);
  const secondVector = subtract(secondEnd, secondStart);
  const firstLength = Math.hypot(firstVector.x, firstVector.y);
  const secondLength = Math.hypot(secondVector.x, secondVector.y);

  if (firstLength <= epsilon && secondLength <= epsilon) {
    return endpointTouchCounts && samePoint(firstStart, secondStart, epsilon);
  }
  if (firstLength <= epsilon) {
    if (!pointOnSegment(firstStart, secondStart, secondEnd, epsilon)) return false;
    const isSharedEndpoint = samePoint(firstStart, secondStart, epsilon) || samePoint(firstStart, secondEnd, epsilon);
    return endpointTouchCounts || !isSharedEndpoint;
  }
  if (secondLength <= epsilon) {
    if (!pointOnSegment(secondStart, firstStart, firstEnd, epsilon)) return false;
    const isSharedEndpoint = samePoint(secondStart, firstStart, epsilon) || samePoint(secondStart, firstEnd, epsilon);
    return endpointTouchCounts || !isSharedEndpoint;
  }

  const betweenStarts = subtract(secondStart, firstStart);
  const denominator = cross(firstVector, secondVector);

  if (Math.abs(denominator) <= epsilon) {
    if (Math.abs(cross(betweenStarts, firstVector)) > epsilon) return false;
    const axis = Math.abs(firstVector.x) >= Math.abs(firstVector.y) ? "x" : "y";
    const firstMinimum = Math.min(firstStart[axis], firstEnd[axis]);
    const firstMaximum = Math.max(firstStart[axis], firstEnd[axis]);
    const secondMinimum = Math.min(secondStart[axis], secondEnd[axis]);
    const secondMaximum = Math.max(secondStart[axis], secondEnd[axis]);
    const sharedLength = Math.min(firstMaximum, secondMaximum) - Math.max(firstMinimum, secondMinimum);
    return sharedLength > epsilon || (endpointTouchCounts && sharedLength >= -epsilon);
  }

  const firstRatio = cross(betweenStarts, secondVector) / denominator;
  const secondRatio = cross(betweenStarts, firstVector) / denominator;
  if (firstRatio < -epsilon || firstRatio > 1 + epsilon || secondRatio < -epsilon || secondRatio > 1 + epsilon) return false;
  const intersection = {
    x: firstStart.x + firstVector.x * firstRatio,
    y: firstStart.y + firstVector.y * firstRatio,
  };
  const isSharedEndpoint = (samePoint(intersection, firstStart, epsilon) || samePoint(intersection, firstEnd, epsilon))
    && (samePoint(intersection, secondStart, epsilon) || samePoint(intersection, secondEnd, epsilon));
  return endpointTouchCounts || !isSharedEndpoint;
}

/** Tests a full straight/one-turn leader against another one before committing a drag. */
export function customBoardLeaderPathsConflict(
  first: NormalizedPoint[],
  second: NormalizedPoint[],
  options: SegmentConflictOptions = {},
): boolean {
  const firstPath = normalizeLeaderPath(first);
  const secondPath = normalizeLeaderPath(second);
  return firstPath.slice(0, -1).some((start, index) => (
    secondPath.slice(0, -1).some((otherStart, otherIndex) => (
      customBoardSegmentsConflict(start, firstPath[index + 1], otherStart, secondPath[otherIndex + 1], options)
    ))
  ));
}

export function pointInLabelBox(point: NormalizedPoint, box: NormalizedLabelBox, epsilon = 0.000001): boolean {
  return point.x >= box.left - epsilon
    && point.x <= box.left + box.width + epsilon
    && point.y >= box.top - epsilon
    && point.y <= box.top + box.height + epsilon;
}

/** True when a leader reaches or passes through another label's visible area. */
export function leaderIntersectsLabelBox(path: NormalizedPoint[], box: NormalizedLabelBox): boolean {
  const normalized = normalizeLeaderPath(path);
  if (normalized.some((point) => pointInLabelBox(point, box))) return true;
  const topLeft = { x: box.left, y: box.top };
  const topRight = { x: box.left + box.width, y: box.top };
  const bottomRight = { x: box.left + box.width, y: box.top + box.height };
  const bottomLeft = { x: box.left, y: box.top + box.height };
  const edges: Array<[NormalizedPoint, NormalizedPoint]> = [
    [topLeft, topRight],
    [topRight, bottomRight],
    [bottomRight, bottomLeft],
    [bottomLeft, topLeft],
  ];
  return normalized.slice(0, -1).some((start, index) => (
    edges.some(([edgeStart, edgeEnd]) => (
      customBoardSegmentsConflict(start, normalized[index + 1], edgeStart, edgeEnd, { endpointTouchCounts: true })
    ))
  ));
}

/**
 * Checks a proposed drag position against every other placed label. The UI can
 * keep the last valid position whenever this reports one or more conflicts.
 */
export function customLabelLayoutConflicts(
  candidate: CustomLabelGeometry,
  others: CustomLabelGeometry[],
  gap = 0.012,
): CustomLabelLayoutConflict[] {
  const candidateLeader = visualLabelLeaderPath(candidate);
  return others.flatMap((other) => {
    if (other.id === candidate.id) return [];
    const conflicts: CustomLabelLayoutConflict[] = [];
    if (boxesOverlap(candidate.box, other.box, gap)) {
      conflicts.push({ kind: "label-overlap", withId: other.id });
    }
    const otherLeader = visualLabelLeaderPath(other);
    if (candidateLeader.length && leaderIntersectsLabelBox(candidateLeader, other.box)) {
      conflicts.push({ kind: "leader-crosses-label", withId: other.id });
    }
    if (otherLeader.length && leaderIntersectsLabelBox(otherLeader, candidate.box)) {
      conflicts.push({ kind: "leader-crosses-label", withId: other.id });
    }
    if (candidateLeader.length && otherLeader.length && customBoardLeaderPathsConflict(candidateLeader, otherLeader)) {
      conflicts.push({ kind: "leader-crosses-leader", withId: other.id });
    }
    return conflicts;
  });
}

export function validateCustomLabelLayout(
  candidate: CustomLabelGeometry,
  others: CustomLabelGeometry[],
  gap = 0.012,
): LabelLayoutValidation {
  const conflicts = customLabelLayoutConflicts(candidate, others, gap);
  return { isValid: conflicts.length === 0, conflicts };
}
