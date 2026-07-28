import {
  hasSharedPhotoLibraryWriteAccess,
  sharedPhotoLibraryDatabase,
  sharedPhotoLibraryImages,
} from "../../../shared-photo-library-server";

export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 35 * 1024 * 1024;
const MEDIA_ID_PATTERN = /^[a-z][a-z0-9-]{0,159}$/;
const FORMATS: Record<string, { extension: string; mimeType: string }> = {
  ".jpg": { extension: ".jpg", mimeType: "image/jpeg" },
  ".jpeg": { extension: ".jpeg", mimeType: "image/jpeg" },
  ".png": { extension: ".png", mimeType: "image/png" },
  ".webp": { extension: ".webp", mimeType: "image/webp" },
  ".heic": { extension: ".heic", mimeType: "image/heic" },
  ".heif": { extension: ".heif", mimeType: "image/heif" },
};

type StoredMedia = {
  media_id: string;
  filename: string;
  mime_type: string;
  byte_size: number;
  width: number;
  height: number;
  object_key: string;
  created_at: string;
  updated_at: string;
};

type UploadMetadata = { filename: string; mimeType: string; width: number; height: number; createdAt: string };

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  };
}

function error(message: string, status: number): Response {
  return Response.json({ error: message }, { status, headers: corsHeaders() });
}

function isFile(value: FormDataEntryValue | null): value is File {
  return typeof value === "object" && value !== null && "arrayBuffer" in value && "size" in value && "name" in value;
}

function formatFor(filename: string) {
  const extension = filename.trim().match(/\.(?:jpe?g|png|webp|heic|heif)$/i)?.[0]?.toLocaleLowerCase();
  return extension ? FORMATS[extension] ?? null : null;
}

function parseMetadata(value: unknown): UploadMetadata | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (Object.keys(record).some((key) => !["filename", "mimeType", "width", "height", "createdAt"].includes(key))) return null;
  if (typeof record.filename !== "string" || !record.filename.trim() || record.filename.length > 500 || /[\\/]/.test(record.filename)) return null;
  if (typeof record.mimeType !== "string" || !record.mimeType.startsWith("image/") || record.mimeType.length > 200) return null;
  if (!Number.isInteger(record.width) || !Number.isInteger(record.height) || record.width <= 0 || record.height <= 0 || record.width > 100_000 || record.height > 100_000) return null;
  if (typeof record.createdAt !== "string" || !Number.isFinite(Date.parse(record.createdAt))) return null;
  return record as UploadMetadata;
}

function isSafeMediaId(value: string): boolean {
  return MEDIA_ID_PATTERN.test(value);
}

async function mediaForId(mediaId: string): Promise<StoredMedia | null> {
  return (await sharedPhotoLibraryDatabase()).prepare(`SELECT media_id, filename, mime_type, byte_size, width, height,
    object_key, created_at, updated_at FROM planner_local_media WHERE media_id = ?`)
    .bind(mediaId)
    .first<StoredMedia>();
}

function metadata(row: StoredMedia) {
  return {
    id: row.media_id,
    filename: row.filename,
    mimeType: row.mime_type,
    byteSize: row.byte_size,
    width: row.width,
    height: row.height,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request: Request, context: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await context.params;
  if (!isSafeMediaId(mediaId)) return error("Planner photo not found.", 404);
  try {
    const row = await mediaForId(mediaId);
    if (!row) return error("Planner photo not found.", 404);
    if (new URL(request.url).searchParams.get("metadata") === "1") {
      return Response.json(metadata(row), { headers: corsHeaders() });
    }
    const object = await (await sharedPhotoLibraryImages()).get(row.object_key);
    if (!object) return error("Planner photo not found.", 404);
    return new Response(object.body, {
      headers: {
        ...corsHeaders(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": row.mime_type,
        "Content-Length": String(row.byte_size),
        "X-Planner-Photo-Filename": row.filename,
        "X-Planner-Photo-Width": String(row.width),
        "X-Planner-Photo-Height": String(row.height),
        "X-Planner-Photo-Created-At": row.created_at,
      },
    });
  } catch {
    return error("Planner photo storage is temporarily unavailable.", 503);
  }
}

export async function HEAD(_request: Request, context: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await context.params;
  if (!isSafeMediaId(mediaId)) return new Response(null, { status: 404, headers: corsHeaders() });
  try {
    const row = await mediaForId(mediaId);
    if (!row) return new Response(null, { status: 404, headers: corsHeaders() });
    return new Response(null, { headers: { ...corsHeaders(), "Content-Type": row.mime_type, "Content-Length": String(row.byte_size) } });
  } catch {
    return new Response(null, { status: 503, headers: corsHeaders() });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await context.params;
  if (!isSafeMediaId(mediaId)) return error("Planner photo ID is invalid.", 400);
  if (!(await hasSharedPhotoLibraryWriteAccess(request))) {
    return error("Sign in with the owner ChatGPT account before uploading planner photos.", 401);
  }
  try {
    const form = await request.formData();
    const file = form.get("file");
    const rawMetadata = form.get("metadata");
    if (!isFile(file) || typeof rawMetadata !== "string") return error("Choose one planner image.", 400);
    let parsed: unknown;
    try { parsed = JSON.parse(rawMetadata) as unknown; } catch { return error("Planner photo metadata is invalid.", 400); }
    const photo = parseMetadata(parsed);
    const format = photo ? formatFor(photo.filename) : null;
    if (!photo || !format || file.size < 1 || file.size > MAX_IMAGE_BYTES) return error("Use a supported planner image under 35 MB.", 400);
    const existing = await mediaForId(mediaId);
    if (existing) {
      const same = existing.filename === photo.filename && existing.byte_size === file.size && existing.width === photo.width && existing.height === photo.height;
      return same ? Response.json(metadata(existing), { headers: corsHeaders() }) : error("This planner photo ID already belongs to another image.", 409);
    }
    const timestamp = new Date().toISOString();
    const objectKey = `planner-local-media/${mediaId}${format.extension}`;
    await (await sharedPhotoLibraryImages()).put(objectKey, await file.arrayBuffer(), {
      httpMetadata: { contentType: format.mimeType },
      customMetadata: { filename: photo.filename },
    });
    await (await sharedPhotoLibraryDatabase()).prepare(`INSERT INTO planner_local_media
      (media_id, filename, mime_type, byte_size, width, height, object_key, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(mediaId, photo.filename, format.mimeType, file.size, photo.width, photo.height, objectKey, photo.createdAt, timestamp)
      .run();
    const saved = await mediaForId(mediaId);
    return saved ? Response.json(metadata(saved), { status: 201, headers: corsHeaders() }) : error("Planner photo could not be read after saving.", 503);
  } catch {
    return error("Planner photo could not be uploaded.", 503);
  }
}
