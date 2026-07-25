import { getChatGPTUser } from "../../chatgpt-auth";
import { parseCustomBoardImportJson, type CustomBoardImportArea } from "../../custom-board-import";
import {
  isAllowedSharedPhoto,
  MAX_SHARED_PHOTO_BATCH_BYTES,
  MAX_SHARED_PHOTO_BYTES,
  normalizedSharedPhotoName,
  SHARED_PHOTO_LIBRARY_VERSION,
  sharedPhotoBoardForImport,
  sharedPhotoMetadataByName,
  sharedPhotoMimeType,
  type SharedPhotoLibraryArea,
  type SharedPhotoUploadMetadata,
} from "../../shared-photo-library";
import {
  hasInitialSharedPhotoLibrarySeedAuthorization,
  hasSameOrigin,
  isSharedPhotoLibraryOwner,
  sharedPhotoLibraryDatabase,
  sharedPhotoLibraryImages,
} from "../../shared-photo-library-server";

export const dynamic = "force-dynamic";

type StoredPhotoArea = {
  source_id: string;
  board_id: string;
  photo_id: string;
  title: string;
  event_name: string | null;
  filename: string;
  mime_type: string;
  width: number;
  height: number;
  photo_scale: number | null;
  spots_json: string;
  created_at: string;
  updated_at: string;
};

type UploadedPhoto = {
  area: CustomBoardImportArea;
  file: File;
  metadata: SharedPhotoUploadMetadata;
};

type StagedPhoto = UploadedPhoto & {
  objectKey: string;
  mimeType: string;
  board: ReturnType<typeof sharedPhotoBoardForImport>;
};

function publicCorsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

function isFile(value: FormDataEntryValue | null): value is File {
  return typeof value === "object"
    && value !== null
    && "arrayBuffer" in value
    && "name" in value
    && "size" in value;
}

function isSafePhotoId(value: string): boolean {
  return /^photo-custom-board-import-[a-z0-9][a-z0-9-]{0,119}$/.test(value);
}

function extensionForFilename(filename: string): string | null {
  const match = filename.trim().match(/\.(jpe?g|png|webp|heic|heif)$/i);
  return match ? match[0].toLocaleLowerCase() : null;
}

function rowToPublicArea(row: StoredPhotoArea, request: Request): SharedPhotoLibraryArea | null {
  try {
    const spots: unknown = JSON.parse(row.spots_json);
    if (!Array.isArray(spots) || !isSafePhotoId(row.photo_id)) return null;
    const board = {
      id: row.board_id,
      title: row.title,
      ...(row.event_name ? { eventName: row.event_name } : {}),
      photoId: row.photo_id,
      filename: row.filename,
      width: row.width,
      height: row.height,
      ...(row.photo_scale === null ? {} : { photoScale: row.photo_scale }),
      spots,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
    const imageUrl = new URL(`/api/shared-photo-areas/${encodeURIComponent(row.photo_id)}`, request.url).toString();
    return { sourceId: row.source_id, board, imageUrl } as SharedPhotoLibraryArea;
  } catch {
    return null;
  }
}

async function existingSourceIds(areas: readonly CustomBoardImportArea[]): Promise<Set<string>> {
  const database = sharedPhotoLibraryDatabase();
  const placeholders = areas.map(() => "?").join(", ");
  const result = await database
    .prepare(`SELECT source_id FROM shared_photo_areas WHERE source_id IN (${placeholders})`)
    .bind(...areas.map((area) => area.sourceId))
    .all<{ source_id: string }>();
  return new Set(result.results.map((row: { source_id: string }) => row.source_id));
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: publicCorsHeaders() });
}

/** Public manifest consumed by the GitHub Pages planner on every device. */
export async function GET(request: Request) {
  try {
    const database = sharedPhotoLibraryDatabase();
    const result = await database
      .prepare(`SELECT source_id, board_id, photo_id, title, event_name, filename, mime_type, width, height, photo_scale, spots_json, created_at, updated_at
        FROM shared_photo_areas ORDER BY title COLLATE NOCASE, source_id`)
      .all<StoredPhotoArea>();
    const areas: Array<SharedPhotoLibraryArea | null> = result.results.map((row: StoredPhotoArea) => rowToPublicArea(row, request));
    if (areas.some((area) => area === null)) {
      return jsonError("The shared photo library contains an invalid record.", 500);
    }
    const validAreas = areas as SharedPhotoLibraryArea[];
    const updatedAt = validAreas.reduce<string | null>((latest: string | null, area: SharedPhotoLibraryArea) => (
      latest === null || area.board.updatedAt > latest ? area.board.updatedAt : latest
    ), null);
    return Response.json(
      { version: SHARED_PHOTO_LIBRARY_VERSION, updatedAt, areas: validAreas },
      { headers: { ...publicCorsHeaders(), "Cache-Control": "no-cache" } },
    );
  } catch {
    return jsonError("The shared photo library is temporarily unavailable.", 503);
  }
}

/** Owner-only append import. Existing source IDs are deliberately never replaced. */
export async function POST(request: Request) {
  const isInitialSeed = hasInitialSharedPhotoLibrarySeedAuthorization(request);
  if (!isInitialSeed) {
    const user = await getChatGPTUser();
    if (!user) return jsonError("Sign in with ChatGPT to manage the shared photo library.", 401);
    if (!isSharedPhotoLibraryOwner(user)) return jsonError("This signed-in account cannot manage the shared photo library.", 403);
    if (!hasSameOrigin(request)) return jsonError("Shared-library updates must come from the library manager.", 403);
  }

  try {
    const form = await request.formData();
    const manifestFile = form.get("manifest");
    if (!isFile(manifestFile)) return jsonError("Choose one Lesson Planner photo-area JSON file.", 400);
    const parsed = parseCustomBoardImportJson(await manifestFile.text(), manifestFile.size);
    if (!parsed.ok) return jsonError(parsed.error, 400);

    const photoEntries = form.getAll("photos");
    if (!photoEntries.length || !photoEntries.every((entry) => isFile(entry))) {
      return jsonError("Choose the image files that belong to the photo-area JSON.", 400);
    }
    if (photoEntries.length > 250) return jsonError("Choose no more than 250 photo areas at once.", 400);
    const photos = photoEntries as File[];
    const totalBytes = photos.reduce((total, file) => total + file.size, 0);
    if (totalBytes > MAX_SHARED_PHOTO_BATCH_BYTES) {
      return jsonError("This photo batch is too large. Publish no more than 100 MB at a time.", 413);
    }
    const photoByName = new Map<string, File>();
    for (const photo of photos) {
      if (!isAllowedSharedPhoto(photo)) {
        return jsonError(`Use JPEG, PNG, WEBP, HEIC, or HEIF images under ${Math.round(MAX_SHARED_PHOTO_BYTES / 1024 / 1024)} MB.`, 400);
      }
      const name = normalizedSharedPhotoName(photo.name);
      if (photoByName.has(name)) return jsonError(`Choose ${photo.name} only once.`, 400);
      photoByName.set(name, photo);
    }

    const metadataEntry = form.get("metadata");
    if (typeof metadataEntry !== "string") return jsonError("The image dimensions were not supplied.", 400);
    let rawMetadata: unknown;
    try {
      rawMetadata = JSON.parse(metadataEntry);
    } catch {
      return jsonError("The image dimensions are not valid.", 400);
    }
    if (!Array.isArray(rawMetadata)) return jsonError("The image dimensions are not valid.", 400);
    const metadataByName = sharedPhotoMetadataByName(rawMetadata as SharedPhotoUploadMetadata[]);
    if (!metadataByName) return jsonError("One or more image dimensions are invalid.", 400);

    const manifestPhotoNames = new Set(parsed.value.areas.map((area) => normalizedSharedPhotoName(area.photo)));
    if ([...photoByName.keys()].some((name) => !manifestPhotoNames.has(name))) {
      return jsonError("Every selected image must be named by the photo-area JSON.", 400);
    }
    if ([...metadataByName.keys()].some((name) => !photoByName.has(name))) {
      return jsonError("The image metadata does not match the selected photos.", 400);
    }

    const existing = await existingSourceIds(parsed.value.areas);
    const additions = parsed.value.areas.filter((area) => !existing.has(area.sourceId));
    const uploads: UploadedPhoto[] = [];
    for (const area of additions) {
      const name = normalizedSharedPhotoName(area.photo);
      const file = photoByName.get(name);
      const metadata = metadataByName.get(name);
      if (!file || !metadata) return jsonError(`Missing ${area.photo}.`, 400);
      uploads.push({ area, file, metadata: { ...metadata, photo: area.photo } });
    }

    const timestamp = new Date().toISOString();
    const images = sharedPhotoLibraryImages();
    const staged: StagedPhoto[] = [];
    for (const upload of uploads) {
      const board = sharedPhotoBoardForImport(upload.area, upload.metadata, timestamp);
      const extension = extensionForFilename(upload.metadata.photo);
      const mimeType = sharedPhotoMimeType(upload.metadata.photo);
      if (!extension || !mimeType) return jsonError(`Unsupported image type for ${upload.metadata.photo}.`, 400);
      const objectKey = `photo-areas/${board.photoId}${extension}`;
      await images.put(objectKey, await upload.file.arrayBuffer(), {
        httpMetadata: { contentType: mimeType },
        customMetadata: { filename: upload.metadata.photo },
      });
      staged.push({ ...upload, board, objectKey, mimeType });
    }

    if (staged.length) {
      const database = sharedPhotoLibraryDatabase();
      await database.batch(staged.map((entry) => database.prepare(
        `INSERT INTO shared_photo_areas
          (source_id, board_id, photo_id, title, event_name, filename, mime_type, width, height, photo_scale, spots_json, object_key, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        entry.area.sourceId,
        entry.board.id,
        entry.board.photoId,
        entry.board.title,
        entry.board.eventName ?? null,
        entry.board.filename,
        entry.mimeType,
        entry.board.width,
        entry.board.height,
        entry.board.photoScale ?? null,
        JSON.stringify(entry.board.spots),
        entry.objectKey,
        timestamp,
        timestamp,
      )));
    }

    return Response.json({
      added: staged.length,
      skipped: parsed.value.areas.length - staged.length,
      total: parsed.value.areas.length,
      updatedAt: timestamp,
    });
  } catch {
    return jsonError("The shared photo library could not be updated. Nothing new is visible yet.", 500);
  }
}
