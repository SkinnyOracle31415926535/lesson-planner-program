import {
  isSafeSharedIdeaMediaId,
  SHARED_IDEA_IMAGE_MAX_BYTES,
  SHARED_IDEA_VIDEO_MAX_BYTES,
  type SharedIdeaMediaMetadata,
} from "../../../shared-idea-library";
import {
  publicIdeaLibraryCorsHeaders,
  sharedIdeaLibraryDatabase,
  sharedIdeaLibraryError,
  sharedIdeaLibraryJson,
  sharedIdeaLibraryMediaBucket,
} from "../../../shared-idea-library-server";

export const dynamic = "force-dynamic";

type StoredMedia = {
  media_id: string;
  idea_id: string;
  media_kind: "image" | "video";
  filename: string;
  mime_type: string;
  byte_size: number;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  object_key: string;
  created_at: string;
  updated_at: string;
};

type UploadMetadata = {
  ideaId: string;
  kind: "image" | "video";
  filename: string;
  mimeType: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  createdAt: string;
};

type MediaFormat = { kind: "image" | "video"; extension: string; mimeType: string };

const FORMATS: Record<string, MediaFormat> = {
  ".jpg": { kind: "image", extension: ".jpg", mimeType: "image/jpeg" },
  ".jpeg": { kind: "image", extension: ".jpeg", mimeType: "image/jpeg" },
  ".png": { kind: "image", extension: ".png", mimeType: "image/png" },
  ".webp": { kind: "image", extension: ".webp", mimeType: "image/webp" },
  ".heic": { kind: "image", extension: ".heic", mimeType: "image/heic" },
  ".heif": { kind: "image", extension: ".heif", mimeType: "image/heif" },
  ".mp4": { kind: "video", extension: ".mp4", mimeType: "video/mp4" },
  ".mov": { kind: "video", extension: ".mov", mimeType: "video/quicktime" },
  ".m4v": { kind: "video", extension: ".m4v", mimeType: "video/x-m4v" },
  ".webm": { kind: "video", extension: ".webm", mimeType: "video/webm" },
};

function isFile(value: FormDataEntryValue | null): value is File {
  return typeof value === "object" && value !== null && "arrayBuffer" in value && "size" in value && "name" in value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isText(value: unknown, maxLength = 500): value is string {
  return typeof value === "string" && value.length <= maxLength && value.trim().length > 0 && !value.includes("\0");
}

function isSafeFilename(value: unknown): value is string {
  return isText(value) && !/[\\/]/.test(value);
}

function isPositiveInteger(value: unknown, maximum: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0 && value <= maximum;
}

function isNonnegativeNumber(value: unknown, maximum: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= maximum;
}

function formatForFilename(filename: string): MediaFormat | null {
  const extension = filename.trim().match(/\.(?:jpe?g|png|webp|heic|heif|mp4|mov|m4v|webm)$/i)?.[0]?.toLocaleLowerCase();
  return extension ? FORMATS[extension] ?? null : null;
}

function compatibleDeclaredMime(kind: "image" | "video", value: string): boolean {
  return value === `${kind}/*` || value.startsWith(`${kind}/`);
}

function parseUploadMetadata(value: unknown): UploadMetadata | null {
  if (!isRecord(value) || Object.keys(value).some((key) => ![
    "ideaId", "kind", "filename", "mimeType", "width", "height", "durationSeconds", "createdAt",
  ].includes(key))) return null;
  if (!isSafeSharedIdeaMediaId(value.ideaId) || (value.kind !== "image" && value.kind !== "video")
    || !isSafeFilename(value.filename) || !isText(value.mimeType, 200) || !compatibleDeclaredMime(value.kind, value.mimeType)
    || !isText(value.createdAt, 100) || !Number.isFinite(Date.parse(value.createdAt))
    || (value.width !== undefined && !isPositiveInteger(value.width, 50_000))
    || (value.height !== undefined && !isPositiveInteger(value.height, 50_000))
    || (value.durationSeconds !== undefined && !isNonnegativeNumber(value.durationSeconds, 86_400))) return null;
  return value as UploadMetadata;
}

function metadataFor(row: StoredMedia): SharedIdeaMediaMetadata {
  return {
    id: row.media_id,
    ideaId: row.idea_id,
    kind: row.media_kind,
    filename: row.filename,
    mimeType: row.mime_type,
    byteSize: row.byte_size,
    ...(row.width === null ? {} : { width: row.width }),
    ...(row.height === null ? {} : { height: row.height }),
    ...(row.duration_seconds === null ? {} : { durationSeconds: row.duration_seconds }),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function binaryHeaders(row: StoredMedia, object: { httpEtag: string }, range: { offset: number; length: number } | null): HeadersInit {
  const size = range ? range.length : row.byte_size;
  const start = range?.offset ?? 0;
  return {
    ...publicIdeaLibraryCorsHeaders(),
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
    "Content-Type": row.mime_type,
    "Content-Length": String(size),
    "Content-Disposition": `inline; filename="${row.filename.replace(/[^a-zA-Z0-9._ -]/g, "_")}"`,
    ETag: object.httpEtag,
    ...(range ? { "Content-Range": `bytes ${start}-${start + size - 1}/${row.byte_size}` } : {}),
  };
}

function parseRange(header: string | null, total: number): { offset: number; length: number } | null | "invalid" {
  if (!header) return null;
  const match = header.match(/^bytes=(\d*)-(\d*)$/i);
  if (!match) return "invalid";
  const [, rawStart, rawEnd] = match;
  if (!rawStart && !rawEnd) return "invalid";
  if (!rawStart) {
    const suffix = Number(rawEnd);
    if (!Number.isInteger(suffix) || suffix <= 0) return "invalid";
    const length = Math.min(suffix, total);
    return { offset: total - length, length };
  }
  const start = Number(rawStart);
  const end = rawEnd ? Number(rawEnd) : total - 1;
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || start >= total) return "invalid";
  return { offset: start, length: Math.min(end, total - 1) - start + 1 };
}

async function mediaForId(mediaId: string): Promise<StoredMedia | null> {
  return (await sharedIdeaLibraryDatabase()).prepare(`SELECT media_id, idea_id, media_kind, filename, mime_type, byte_size,
    width, height, duration_seconds, object_key, created_at, updated_at
    FROM shared_idea_media WHERE media_id = ?`)
    .bind(mediaId)
    .first<StoredMedia>();
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: publicIdeaLibraryCorsHeaders() });
}

export async function GET(request: Request, context: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await context.params;
  if (!isSafeSharedIdeaMediaId(mediaId)) return new Response("Not found", { status: 404, headers: publicIdeaLibraryCorsHeaders() });
  try {
    const row = await mediaForId(mediaId);
    if (!row) return new Response("Not found", { status: 404, headers: publicIdeaLibraryCorsHeaders() });
    if (new URL(request.url).searchParams.get("metadata") === "1") return sharedIdeaLibraryJson(metadataFor(row));
    const requestedRange = parseRange(request.headers.get("range"), row.byte_size);
    if (requestedRange === "invalid") {
      return new Response("Range not satisfiable", {
        status: 416,
        headers: { ...publicIdeaLibraryCorsHeaders(), "Content-Range": `bytes */${row.byte_size}`, "Accept-Ranges": "bytes" },
      });
    }
    const object = await (await sharedIdeaLibraryMediaBucket()).get(row.object_key, requestedRange ? { range: requestedRange } : undefined);
    if (!object) return new Response("Not found", { status: 404, headers: publicIdeaLibraryCorsHeaders() });
    return new Response(object.body, { status: requestedRange ? 206 : 200, headers: binaryHeaders(row, object, requestedRange) });
  } catch {
    return new Response("Attachment unavailable", { status: 503, headers: publicIdeaLibraryCorsHeaders() });
  }
}

export async function HEAD(request: Request, context: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await context.params;
  if (!isSafeSharedIdeaMediaId(mediaId)) return new Response(null, { status: 404, headers: publicIdeaLibraryCorsHeaders() });
  try {
    const row = await mediaForId(mediaId);
    if (!row) return new Response(null, { status: 404, headers: publicIdeaLibraryCorsHeaders() });
    return new Response(null, {
      status: 200,
      headers: {
        ...publicIdeaLibraryCorsHeaders(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": row.mime_type,
        "Content-Length": String(row.byte_size),
        "Accept-Ranges": "bytes",
      },
    });
  } catch {
    return new Response(null, { status: 503, headers: publicIdeaLibraryCorsHeaders() });
  }
}

/** Immutable attachments are uploaded before a state snapshot is allowed to reference them. */
export async function PUT(request: Request, context: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await context.params;
  if (!isSafeSharedIdeaMediaId(mediaId)) return sharedIdeaLibraryError("The Idea Library attachment ID is invalid.", 400);
  try {
    const form = await request.formData();
    const file = form.get("file");
    const rawMetadata = form.get("metadata");
    if (!isFile(file) || typeof rawMetadata !== "string") return sharedIdeaLibraryError("Choose one Idea Library photo or video.", 400);
    let raw: unknown;
    try {
      raw = JSON.parse(rawMetadata) as unknown;
    } catch {
      return sharedIdeaLibraryError("The Idea Library attachment metadata is not valid JSON.", 400);
    }
    const metadata = parseUploadMetadata(raw);
    if (!metadata) return sharedIdeaLibraryError("The Idea Library attachment metadata is invalid.", 400);
    const format = formatForFilename(metadata.filename);
    if (!format || format.kind !== metadata.kind || file.size < 1 || file.size > (metadata.kind === "image" ? SHARED_IDEA_IMAGE_MAX_BYTES : SHARED_IDEA_VIDEO_MAX_BYTES)) {
      return sharedIdeaLibraryError("Use a supported Idea Library photo or video within its size limit.", 400);
    }
    const database = await sharedIdeaLibraryDatabase();
    const existing = await database.prepare(`SELECT media_id, idea_id, media_kind, filename, mime_type, byte_size,
      width, height, duration_seconds, object_key, created_at, updated_at FROM shared_idea_media WHERE media_id = ?`)
      .bind(mediaId)
      .first<StoredMedia>();
    if (existing) {
      const same = existing.idea_id === metadata.ideaId && existing.media_kind === metadata.kind
        && existing.filename === metadata.filename && existing.byte_size === file.size;
      return same
        ? sharedIdeaLibraryJson(metadataFor(existing))
        : sharedIdeaLibraryError("This Idea Library attachment ID already belongs to different media.", 409);
    }
    const timestamp = new Date().toISOString();
    const objectKey = `idea-media/${mediaId}${format.extension}`;
    await (await sharedIdeaLibraryMediaBucket()).put(objectKey, await file.arrayBuffer(), {
      httpMetadata: { contentType: format.mimeType },
      customMetadata: { filename: metadata.filename, ideaId: metadata.ideaId },
    });
    await database.prepare(`INSERT INTO shared_idea_media
      (media_id, idea_id, media_kind, filename, mime_type, byte_size, width, height, duration_seconds, object_key, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(mediaId, metadata.ideaId, metadata.kind, metadata.filename, format.mimeType, file.size,
        metadata.width ?? null, metadata.height ?? null, metadata.durationSeconds ?? null, objectKey, timestamp, timestamp)
      .run();
    const saved = await mediaForId(mediaId);
    return saved ? sharedIdeaLibraryJson(metadataFor(saved), 201) : sharedIdeaLibraryError("The Idea Library attachment could not be read after saving.", 503);
  } catch {
    return sharedIdeaLibraryError("The Idea Library attachment could not be uploaded.", 503);
  }
}
