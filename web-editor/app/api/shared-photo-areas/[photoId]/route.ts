import {
  sharedPhotoLibraryDatabase,
  sharedPhotoLibraryImages,
} from "../../../shared-photo-library-server";

export const dynamic = "force-dynamic";

type StoredPhoto = {
  object_key: string;
  mime_type: string;
  filename: string;
};

function isSafePhotoId(value: string): boolean {
  return /^photo-custom-board-import-[a-z0-9][a-z0-9-]{0,119}$/.test(value);
}

function publicImageHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };
}

export async function GET(_request: Request, context: { params: Promise<{ photoId: string }> }) {
  const { photoId } = await context.params;
  if (!isSafePhotoId(photoId)) return new Response("Not found", { status: 404 });

  try {
    const database = sharedPhotoLibraryDatabase();
    const photo = await database
      .prepare("SELECT object_key, mime_type, filename FROM shared_photo_areas WHERE photo_id = ?")
      .bind(photoId)
      .first<StoredPhoto>();
    if (!photo) return new Response("Not found", { status: 404 });

    const object = await sharedPhotoLibraryImages().get(photo.object_key);
    if (!object) return new Response("Not found", { status: 404 });
    return new Response(object.body, {
      headers: {
        ...publicImageHeaders(),
        "Content-Type": photo.mime_type,
        "Content-Length": String(object.size),
        "Content-Disposition": `inline; filename="${photo.filename.replace(/[^a-zA-Z0-9._ -]/g, "_")}"`,
        ETag: object.httpEtag,
      },
    });
  } catch {
    return new Response("Photo unavailable", { status: 503 });
  }
}
