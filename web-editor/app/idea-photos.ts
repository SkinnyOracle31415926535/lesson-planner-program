/**
 * Browser-local Blob storage for optional Library Idea reference photos.
 *
 * This deliberately uses its own IndexedDB database instead of changing the
 * existing custom-area-photo database. That keeps the two features isolated:
 * adding an idea photo never upgrades, migrates, or rewrites a coach's saved
 * area photos.
 */
export const IDEA_PHOTO_STORAGE_VERSION = 1;

export type StoredIdeaPhoto = {
  /** A durable ID saved in the small LibraryItem metadata record. */
  id: string;
  /** The local LibraryItem this optional photo belongs to. */
  ideaId: string;
  /** The original image bytes. Blob data stays out of localStorage. */
  blob: Blob;
  filename: string;
  mimeType: string;
  width: number;
  height: number;
  createdAt: string;
};

const IDEA_PHOTO_DATABASE_NAME = "gym-lesson-planner-local-idea-media";
const IDEA_PHOTO_STORE_NAME = "ideaPhotos";
const IDEA_PHOTO_DATABASE_VERSION = IDEA_PHOTO_STORAGE_VERSION;

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Local idea photo storage request failed."));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error("Local idea photo storage transaction stopped."));
    transaction.onerror = () => reject(transaction.error ?? new Error("Local idea photo storage transaction failed."));
  });
}

async function ideaPhotoDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    throw new Error("This browser does not support private local idea photo storage.");
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
export function createIdeaPhotoId(ideaId: string): string {
  const ideaPart = ideaId.trim().replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "idea";
  const randomPart = typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID().replace(/-/g, "")
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  return `idea-photo-${ideaPart}-${randomPart}`;
}

/** Saves or replaces exactly one Blob record under its durable photo ID. */
export async function saveIdeaPhoto(photo: StoredIdeaPhoto): Promise<void> {
  const database = await ideaPhotoDatabase();
  try {
    const transaction = database.transaction(IDEA_PHOTO_STORE_NAME, "readwrite");
    transaction.objectStore(IDEA_PHOTO_STORE_NAME).put(photo);
    await transactionDone(transaction);
  } finally {
    database.close();
  }
}

/** Loads a local Blob and its display metadata, or null when it is unavailable. */
export async function loadIdeaPhoto(photoId: string): Promise<StoredIdeaPhoto | null> {
  const database = await ideaPhotoDatabase();
  try {
    const transaction = database.transaction(IDEA_PHOTO_STORE_NAME, "readonly");
    const photo = await requestResult(transaction.objectStore(IDEA_PHOTO_STORE_NAME).get(photoId));
    await transactionDone(transaction);
    return (photo as StoredIdeaPhoto | undefined) ?? null;
  } finally {
    database.close();
  }
}

/** Removes only the Blob record with this ID; unrelated Idea photos remain intact. */
export async function removeIdeaPhoto(photoId: string): Promise<void> {
  const database = await ideaPhotoDatabase();
  try {
    const transaction = database.transaction(IDEA_PHOTO_STORE_NAME, "readwrite");
    transaction.objectStore(IDEA_PHOTO_STORE_NAME).delete(photoId);
    await transactionDone(transaction);
  } finally {
    database.close();
  }
}

/** Alias for callers that describe the action as deleting an attachment. */
export const deleteIdeaPhoto = removeIdeaPhoto;
