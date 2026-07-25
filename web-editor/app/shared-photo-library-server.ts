import { env } from "cloudflare:workers";
import type { ChatGPTUser } from "./chatgpt-auth";

type SharedPhotoLibraryRuntime = {
  DB?: D1Database;
  PHOTO_AREA_IMAGES?: R2Bucket;
  SHARED_LIBRARY_OWNER_EMAIL?: string;
};

function runtime(): SharedPhotoLibraryRuntime {
  return env as unknown as SharedPhotoLibraryRuntime;
}

export function sharedPhotoLibraryDatabase(): D1Database {
  const database = runtime().DB;
  if (!database) throw new Error("The shared photo library database is unavailable.");
  return database;
}

export function sharedPhotoLibraryImages(): R2Bucket {
  const images = runtime().PHOTO_AREA_IMAGES;
  if (!images) throw new Error("The shared photo library image store is unavailable.");
  return images;
}

export function isSharedPhotoLibraryOwner(user: Pick<ChatGPTUser, "email">): boolean {
  const configuredOwner = runtime().SHARED_LIBRARY_OWNER_EMAIL?.trim().toLocaleLowerCase();
  return Boolean(configuredOwner) && user.email.trim().toLocaleLowerCase() === configuredOwner;
}

/** Reject cross-site mutation attempts even when a browser has an active SIWC session. */
export function hasSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return Boolean(origin) && origin === new URL(request.url).origin;
}
