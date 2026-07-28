import { getChatGPTUser, type ChatGPTUser } from "./chatgpt-auth";

type SharedPhotoLibraryRuntime = {
  DB?: D1Database;
  PHOTO_AREA_IMAGES?: R2Bucket;
  SHARED_LIBRARY_OWNER_EMAIL?: string;
};

async function runtime(): Promise<SharedPhotoLibraryRuntime> {
  const workers = await import("cloudflare:workers") as unknown as { env: SharedPhotoLibraryRuntime };
  return workers.env;
}

export async function sharedPhotoLibraryDatabase(): Promise<D1Database> {
  const database = (await runtime()).DB;
  if (!database) throw new Error("The shared photo library database is unavailable.");
  return database;
}

export async function sharedPhotoLibraryImages(): Promise<R2Bucket> {
  const images = (await runtime()).PHOTO_AREA_IMAGES;
  if (!images) throw new Error("The shared photo library image store is unavailable.");
  return images;
}

export async function isSharedPhotoLibraryOwner(user: Pick<ChatGPTUser, "email">): Promise<boolean> {
  const configuredOwner = (await runtime()).SHARED_LIBRARY_OWNER_EMAIL?.trim().toLocaleLowerCase();
  return Boolean(configuredOwner) && user.email.trim().toLocaleLowerCase() === configuredOwner;
}

/** Synchronized planner records are readable only by the configured owner. */
export async function hasSharedPhotoLibraryReadAccess(request: Request): Promise<boolean> {
  const user = await getChatGPTUser();
  if (!user || !(await isSharedPhotoLibraryOwner(user))) return false;
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

/** Mutations also require the configured owner and this service's own origin. */
export async function hasSharedPhotoLibraryWriteAccess(request: Request): Promise<boolean> {
  const user = await getChatGPTUser();
  return Boolean(user) && (await isSharedPhotoLibraryOwner(user)) && hasSameOrigin(request);
}

/** Reject cross-site mutation attempts even when a browser has an active SIWC session. */
export function hasSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return Boolean(origin) && origin === new URL(request.url).origin;
}
