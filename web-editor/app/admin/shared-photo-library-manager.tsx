"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  isAllowedSharedPhoto,
  sharedPhotoMetadataByName,
  type SharedPhotoLibraryUploadResult,
  type SharedPhotoUploadMetadata,
} from "../shared-photo-library";
import {
  MAX_CUSTOM_BOARD_IMPORT_AREAS,
  parseCustomBoardImportJson,
  planCustomBoardImport,
  type CustomBoardImportBundleV1,
} from "../custom-board-import";

type Selection = {
  manifest: File;
  photos: File[];
  parsed: CustomBoardImportBundleV1;
};

function imageDimensions(file: File): Promise<SharedPhotoUploadMetadata> {
  return new Promise((resolve, reject) => {
    const sourceUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(sourceUrl);
      resolve({ photo: file.name, width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(sourceUrl);
      reject(new Error(`${file.name} could not be opened as an image.`));
    };
    image.src = sourceUrl;
  });
}

function selectedFilesError(files: File[]): { error: string } | null {
  const manifestFiles = files.filter((file) => file.type === "application/json" || /\.json$/i.test(file.name));
  const photos = files.filter((file) => !manifestFiles.includes(file));
  if (manifestFiles.length !== 1) return { error: "Choose exactly one Lesson Planner photo-area JSON file." };
  if (!photos.length) return { error: "Choose the photo files named by that JSON file too." };
  if (photos.length > MAX_CUSTOM_BOARD_IMPORT_AREAS) return { error: "Choose no more than 250 photo areas at once." };
  const invalid = photos.find((photo) => !isAllowedSharedPhoto(photo));
  if (invalid) return { error: `${invalid.name} is not a supported image under 35 MB.` };
  return null;
}

export function SharedPhotoLibraryManager() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [message, setMessage] = useState("Choose your JSON file and the matching gym-area photos once.");
  const [isPublishing, setIsPublishing] = useState(false);

  async function selectFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (!files.length) return;
    const preliminaryError = selectedFilesError(files);
    if (preliminaryError) {
      setSelection(null);
      setMessage(preliminaryError.error);
      return;
    }

    const manifest = files.find((file) => file.type === "application/json" || /\.json$/i.test(file.name));
    if (!manifest) return;
    const parsed = parseCustomBoardImportJson(await manifest.text(), manifest.size);
    if (!parsed.ok) {
      setSelection(null);
      setMessage(parsed.error);
      return;
    }

    const photos = files.filter((file) => file !== manifest);
    const plan = planCustomBoardImport(parsed.value.areas, photos.map((file) => file.name), []);
    if (plan.ambiguousPhotoNames.length) {
      setSelection(null);
      setMessage(`Choose each image only once. Duplicate: ${plan.ambiguousPhotoNames.join(", ")}.`);
      return;
    }
    if (plan.missingPhotoAreas.length) {
      setSelection(null);
      setMessage(`Missing photo${plan.missingPhotoAreas.length === 1 ? "" : "s"}: ${plan.missingPhotoAreas.map((area) => area.photo).join(", ")}.`);
      return;
    }
    if (plan.unmatchedPhotoNames.length) {
      setSelection(null);
      setMessage(`The JSON does not describe: ${plan.unmatchedPhotoNames.join(", ")}.`);
      return;
    }

    setSelection({ manifest, photos, parsed: parsed.value });
    setMessage(`${parsed.value.areas.length} photo area${parsed.value.areas.length === 1 ? "" : "s"} are ready. Existing shared areas will be skipped, never replaced.`);
  }

  async function publish() {
    if (!selection || isPublishing) return;
    setIsPublishing(true);
    try {
      const metadata = await Promise.all(selection.photos.map(imageDimensions));
      const metadataByName = sharedPhotoMetadataByName(metadata);
      if (!metadataByName) throw new Error("The selected image filenames are not unique.");
      let added = 0;
      let skipped = 0;
      for (const photo of selection.photos) {
        const fileMetadata = metadataByName.get(photo.name.trim().toLocaleLowerCase());
        if (!fileMetadata) throw new Error(`The dimensions for ${photo.name} are unavailable.`);
        const body = new FormData();
        body.set("manifest", selection.manifest);
        body.set("metadata", JSON.stringify([fileMetadata]));
        body.append("photos", photo);
        const response = await fetch("/api/shared-photo-areas", { method: "POST", body });
        const result = await response.json() as SharedPhotoLibraryUploadResult | { error?: string };
        if (!response.ok || !("added" in result)) {
          throw new Error("error" in result && result.error ? result.error : "The shared photo library could not be updated.");
        }
        added += result.added;
        skipped += result.skipped;
      }
      setMessage(`${added} shared area${added === 1 ? "" : "s"} published · ${skipped} already in the library · every planner link will load them automatically.`);
      setSelection(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The shared photo library could not be updated.");
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <main className="shared-library-shell">
      <section className="shared-library-window retro-window">
        <div className="window-title">SHARED PHOTO LIBRARY <span>PUBLISH ONCE · LOAD EVERYWHERE</span></div>
        <div className="shared-library-body">
          <p className="pixel-label">LIBRARY MANAGER</p>
          <h1>Publish gym photo areas</h1>
          <p>These photos are public to load in the Lesson Planner. Lesson plans, classes, attendance, and other local information are not uploaded here.</p>
          <div className="shared-library-actions">
            <button type="button" onClick={() => inputRef.current?.click()}>CHOOSE JSON + PHOTOS</button>
            <button type="button" disabled={!selection || isPublishing} onClick={() => { void publish(); }}>
              {isPublishing ? "PUBLISHING…" : selection ? `PUBLISH ${selection.parsed.areas.length} AREA${selection.parsed.areas.length === 1 ? "" : "S"}` : "PUBLISH SHARED LIBRARY"}
            </button>
            <Link className="shared-library-link" href="/">OPEN LESSON PLANNER</Link>
          </div>
          <input
            ref={inputRef}
            className="new-idea-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif,.json,application/json"
            multiple
            hidden
            aria-hidden="true"
            tabIndex={-1}
            onChange={(event) => { void selectFiles(event.currentTarget.files); }}
          />
          <div className={`shared-library-status ${selection ? "ready" : ""}`} role="status">
            <b>{selection ? `${selection.parsed.areas.length} AREAS READY` : "WAITING FOR FILES"}</b>
            <span>{message}</span>
          </div>
          {selection ? (
            <ul className="shared-library-area-list">
              {selection.parsed.areas.map((area) => <li key={area.sourceId}><b>{area.eventName ?? "AREA"}</b><span>{area.title} · {area.photo}</span></li>)}
            </ul>
          ) : null}
          <small>Use the same portable JSON format as the Lesson Planner importer. A later import only adds new source IDs, so existing shared photo areas stay unchanged.</small>
        </div>
      </section>
    </main>
  );
}
