/**
 * Meter-scale Station Maker catalog.
 *
 * This is the app-facing transcription of the owner-supplied Mats equipment
 * reference catalog (version 1.0.0). Its important rule is deliberately
 * encoded in the types below:
 * only records with verified length, width, and height can be placed in a
 * scale scene.  A photo, product-family match, or common gym-mat size is not
 * a measurement.
 */

export const STATION_EQUIPMENT_CATALOG_SOURCE = {
  name: "Mats equipment reference catalog",
  version: "1.0.0",
  sceneUnit: "meter",
} as const;

export type StationEquipmentProfile = "incline" | "vault" | "trainer" | "unknown";
export type StationEquipmentMeasurementStatus = "verified" | "needs-measurement";

type MeterDimensions = {
  /** In the normal in-use orientation from the reference catalog. */
  length: number;
  width: number;
  heightMin: number;
  heightMax: number;
};

type StationEquipmentDefinition = {
  id: string;
  name: string;
  measurementStatus: StationEquipmentMeasurementStatus;
  profile: StationEquipmentProfile;
  /** Present only after the source reference verifies all three dimensions. */
  dimensions?: MeterDimensions;
};

/**
 * All 35 known reference items are intentionally represented here.  The 32
 * unmeasured records stay visible in the palette, but are disabled so the
 * scene never pretends a guessed footprint is real.
 */
export const stationEquipmentCatalog = [
  { id: "tumbl-trak-pit-pillow", name: "TUMBL TRAK PIT PILLOW", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "yellow-red-blue-octagonal-ring", name: "YELLOW/RED/BLUE OCTAGONAL RING", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "green-tapered-wall-wedge", name: "NEON-GREEN TALL TAPERED WALL/WEDGE", measurementStatus: "needs-measurement", profile: "unknown" },
  {
    id: "norberts-power-incline-2",
    name: "NORBERT'S POWER INCLINE 2.0",
    measurementStatus: "verified",
    profile: "incline",
    dimensions: { length: 1.2192, width: 1.016, heightMin: 0.0762, heightMax: 0.3556 },
  },
  { id: "yellow-norberts-tapered-wedge", name: "YELLOW NORBERT'S TAPERED WEDGE", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "green-norberts-tapered-wedge", name: "GREEN NORBERT'S TAPERED WEDGE", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "green-half-cylinder", name: "GREEN HALF-CYLINDER FOAM BARREL", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "red-norberts-trapezoid-component", name: "RED NORBERT'S TRAPEZOID COMPONENT", measurementStatus: "needs-measurement", profile: "unknown" },
  {
    id: "spieth-ergojet-rio-vaulting-table",
    name: "SPIETH ERGOJET RIO VAULTING TABLE",
    measurementStatus: "verified",
    profile: "vault",
    dimensions: { length: 1.2, width: 0.95, heightMin: 1, heightMax: 1.4 },
  },
  { id: "blue-lime-striped-panel", name: "BLUE/LIME STRIPED UPRIGHT PANEL", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "red-green-octagonal-tumbler", name: "RED/GREEN OCTAGONAL FOAM TUMBLER", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "red-norberts-narrow-wedge", name: "RED NORBERT'S NARROW WEDGE/BLOCK", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "aai-blue-landing-mat", name: "AAI BLUE RECTANGULAR LANDING MAT", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "gray-blue-bordered-panel", name: "GRAY PANEL WITH BLUE BORDERS", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "tumbl-trak-air-barrel", name: "TUMBL TRAK AIR BARREL", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "blue-white-rectangular-pad", name: "BLUE/WHITE RECTANGULAR PAD", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "small-blue-faceted-block", name: "SMALL BLUE FACETED FOAM BLOCK", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "rainbow-banded-panel", name: "RAINBOW-BANDED UPRIGHT FOAM PANEL", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "large-blue-faceted-block", name: "LARGE BLUE FACETED FOAM BLOCK", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "large-blue-norberts-block", name: "LARGE BLUE NORBERT'S BLOCK", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "green-yellow-blue-low-block", name: "GREEN/YELLOW/BLUE LOW SECTIONAL BLOCK", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "narrow-blue-aai-mat", name: "NARROW BLUE AAI MAT", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "gymnova-gray-folding-mat", name: "GYMNOVA GRAY FOLDING MAT", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "red-yellow-incline-wedge", name: "RED/YELLOW INCLINE WEDGE", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "eurotramp-teamgym-minitramp", name: "EUROTRAMP TEAMGYM MINITRAMP", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "burgundy-upright-mat", name: "BURGUNDY UPRIGHT TAPERED MAT", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "yellow-orange-foam-beam", name: "YELLOW/ORANGE FOAM BEAM", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "spieth-little-thumper-board", name: "SPIETH JUST FOR KIDS LITTLE THUMPER BOARD", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "blue-yellow-stripe-mat", name: "BLUE MAT WITH YELLOW STRIPE", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "purple-boulder-handspring-trainer", name: "PURPLE THE BOULDER HANDSPRING TRAINER", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "red-boulder-handspring-trainer", name: "RED THE BOULDER HANDSPRING TRAINER", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "green-triangular-wall", name: "GREEN TRIANGULAR WALL PANEL", measurementStatus: "needs-measurement", profile: "unknown" },
  {
    id: "tumbl-trak-t-trainer",
    name: "TUMBL TRAK T-TRAINER",
    measurementStatus: "verified",
    profile: "trainer",
    dimensions: { length: 1.2192, width: 0.9144, heightMin: 0.3556, heightMax: 0.508 },
  },
  { id: "gray-round-spot-pad", name: "GRAY ROUND SPOT/REBOUND PAD", measurementStatus: "needs-measurement", profile: "unknown" },
  { id: "red-round-spot-pad", name: "RED ROUND SPOT/REBOUND PAD", measurementStatus: "needs-measurement", profile: "unknown" },
] as const satisfies readonly StationEquipmentDefinition[];

export type StationEquipmentId = (typeof stationEquipmentCatalog)[number]["id"];
export type VerifiedStationEquipmentId = Extract<
  (typeof stationEquipmentCatalog)[number],
  { measurementStatus: "verified" }
>["id"];
export type StationEquipment = StationEquipmentDefinition;

const equipmentById = new Map<string, StationEquipment>(stationEquipmentCatalog.map((item) => [item.id, item]));

export const verifiedStationEquipment = stationEquipmentCatalog.filter((item) => item.measurementStatus === "verified");
export const stationEquipmentNeedingMeasurement = stationEquipmentCatalog.filter((item) => item.measurementStatus === "needs-measurement");

export function isStationEquipmentId(value: unknown): value is StationEquipmentId {
  return typeof value === "string" && equipmentById.has(value);
}

export function stationEquipment(id: StationEquipmentId): StationEquipment {
  const item = equipmentById.get(id);
  if (!item) throw new Error(`Unknown station equipment: ${id}`);
  return item;
}

export function isVerifiedStationEquipmentId(value: unknown): value is VerifiedStationEquipmentId {
  return isStationEquipmentId(value) && stationEquipment(value).measurementStatus === "verified";
}

/** A verified top-down footprint, in scene meters, for a placeable item. */
export function stationEquipmentFootprint(id: VerifiedStationEquipmentId): { length: number; width: number } {
  const dimensions = stationEquipment(id).dimensions;
  // `isVerifiedStationEquipmentId` makes this impossible to reach for an
  // unmeasured catalog record. Keep the guard for a corrupt future catalog.
  if (!dimensions) throw new Error(`Station equipment ${id} needs measurement.`);
  return { length: dimensions.length, width: dimensions.width };
}

export function stationEquipmentHeight(id: VerifiedStationEquipmentId): { minimum: number; maximum: number } {
  const dimensions = stationEquipment(id).dimensions;
  if (!dimensions) throw new Error(`Station equipment ${id} needs measurement.`);
  return { minimum: dimensions.heightMin, maximum: dimensions.heightMax };
}
