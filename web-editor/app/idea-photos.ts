/**
 * Browser-local Blob storage for one optional Library Idea photo or video.
 *
 * The existing database and store names remain unchanged so photos already
 * saved by version 5 keep working. Idea media stays separate from custom-area
 * photos and never enters localStorage or a JSON export.
 */
export const IDEA_MEDIA_STORAGE_VERSION = 1;
export const IDEA_PHOTO_STORAGE_VERSION = IDEA_MEDIA_STORAGE_VERSION;
export const IDEA_IMAGE_MAX_BYTES = 35 * 1024 * 1024;
export const IDEA_VIDEO_MAX_BYTES = 100 * 1024 * 1024;

export type IdeaMediaKind = "image" | "video";

export type StoredIdeaMedia = {
  /** A durable ID saved in the small LibraryItem metadata record. */
  id: string;
  /** The local LibraryItem this optional attachment belongs to. */
  ideaId: string;
  /** Original bytes stay in IndexedDB and out of localStorage. */
  blob: Blob;
  filename: string;
  mimeType: string;
  /** Missing on legacy photo records and normalized to image when loaded. */
  kind?: IdeaMediaKind;
  width?: number;
  height?: number;
  durationSeconds?: number;
  createdAt: string;
};

export type StoredIdeaPhoto = StoredIdeaMedia & {
  kind?: "image";
  width: number;
  height: number;
};

const IDEA_PHOTO_DATABASE_NAME = "gym-lesson-planner-local-idea-media";
const IDEA_PHOTO_STORE_NAME = "ideaPhotos";
const IDEA_PHOTO_DATABASE_VERSION = IDEA_MEDIA_STORAGE_VERSION;

type IdeaMediaFileCandidate = Pick<File, "name" | "size" | "type">;

export function ideaMediaKindForFile(file: IdeaMediaFileCandidate): IdeaMediaKind | null {
  const imageExtension = /\.(?:jpe?g|png|webp|heic|heif)$/i.test(file.name);
  const videoExtension = /\.(?:mp4|m4v|mov|webm)$/i.test(file.name);
  if ((file.type.startsWith("image/") && file.type !== "image/svg+xml") || imageExtension) return "image";
  if (file.type.startsWith("video/") || videoExtension) return "video";
  return null;
}

export function ideaMediaValidationMessage(file: IdeaMediaFileCandidate): string | null {
  const kind = ideaMediaKindForFile(file);
  if (!kind) return "USE A JPEG, PNG, WEBP, HEIC, HEIF, MP4, MOV, M4V, OR WEBM FILE";
  if (kind === "image" && file.size > IDEA_IMAGE_MAX_BYTES) return "USE A PHOTO UNDER 35 MB";
  if (kind === "video" && file.size > IDEA_VIDEO_MAX_BYTES) return "USE A VIDEO UNDER 100 MB";
  return null;
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Local idea media storage request failed."));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error("Local idea media storage transaction stopped."));
    transaction.onerror = () => reject(transaction.error ?? new Error("Local idea media storage transaction failed."));
  });
}

async function ideaPhotoDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    throw new Error("This browser does not support private local idea media storage.");
  }
  const request = indexedDB.open(IDEA_PHOTO_DATABASE_NAME, IDEA_PHOTO_DATABASE_VERSION);
  request.onupgradeneeded = () => {
    if (!request.result.objectStoreNames.contains(IDEA_PHOTO_STORE_NAME)) {
      request.result.createObjectStore(IDEA_PHOTO_STORE_NAME, { keyPath: "id" });
    }
  };
  return requestResult(request);
}

/**
 * Creates an opaque, durable ID suitable for linking one locally stored Blob
 * from a LibraryItem. The calling screen should persist this exact value; it
 * should not derive a new one each time it renders.
 */
export function createIdeaMediaId(ideaId: string): string {
  const ideaPart = ideaId.trim().replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "idea";
  const randomPart = typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID().replace(/-/g, "")
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  return `idea-photo-${ideaPart}-${randomPart}`;
}

/** Saves or replaces exactly one Blob record under its durable media ID. */
export async function saveIdeaMedia(media: StoredIdeaMedia): Promise<void> {
  const database = await ideaPhotoDatabase();
  try {
    const transaction = database.transaction(IDEA_PHOTO_STORE_NAME, "readwrite");
    transaction.objectStore(IDEA_PHOTO_STORE_NAME).put(media);
    await transactionDone(transaction);
  } finally {
    database.close();
  }
}

/** Loads a local Blob and its display metadata, or null when it is unavailable. */
export async function loadIdeaMedia(mediaId: string): Promise<StoredIdeaMedia | null> {
  const database = await ideaPhotoDatabase();
  try {
    const transaction = database.transaction(IDEA_PHOTO_STORE_NAME, "readonly");
    const media = await requestResult(transaction.objectStore(IDEA_PHOTO_STORE_NAME).get(mediaId));
    await transactionDone(transaction);
    if (!media) return null;
    const stored = media as StoredIdeaMedia;
    return {
      ...stored,
      kind: stored.kind ?? (stored.mimeType.startsWith("video/") ? "video" : "image"),
    };
  } finally {
    database.close();
  }
}

/** Reads every browser-local Idea attachment for a complete planner backup. */
export async function listIdeaMedia(): Promise<StoredIdeaMedia[]> {
  const database = await ideaPhotoDatabase();
  try {
    const transaction = database.transaction(IDEA_PHOTO_STORE_NAME, "readonly");
    const media = await requestResult(transaction.objectStore(IDEA_PHOTO_STORE_NAME).getAll());
    await transactionDone(transaction);
    return (media as StoredIdeaMedia[]).map((entry) => ({
      ...entry,
      kind: entry.kind ?? (entry.mimeType.startsWith("video/") ? "video" : "image"),
    }));
  } finally {
    database.close();
  }
}

/** Restores Idea attachments from a validated full planner backup without deleting unrelated local media. */
export async function restoreIdeaMedia(media: readonly StoredIdeaMedia[]): Promise<void> {
  const database = await ideaPhotoDatabase();
  try {
    const transaction = database.transaction(IDEA_PHOTO_STORE_NAME, "readwrite");
    const store = transaction.objectStore(IDEA_PHOTO_STORE_NAME);
    media.forEach((entry) => store.put(entry));
    await transactionDone(transaction);
  } finally {
    database.close();
  }
}

/** Removes only the Blob record with this ID; unrelated Idea media remains intact. */
export async function removeIdeaMedia(mediaId: string): Promise<void> {
  const database = await ideaPhotoDatabase();
  try {
    const transaction = database.transaction(IDEA_PHOTO_STORE_NAME, "readwrite");
    transaction.objectStore(IDEA_PHOTO_STORE_NAME).delete(mediaId);
    await transactionDone(transaction);
  } finally {
    database.close();
  }
}

/** Legacy aliases keep existing imports and locally saved photo IDs compatible. */
export const createIdeaPhotoId = createIdeaMediaId;
export const saveIdeaPhoto = saveIdeaMedia;
export const loadIdeaPhoto = loadIdeaMedia;
export const removeIdeaPhoto = removeIdeaMedia;
export const deleteIdeaPhoto = removeIdeaMedia;
