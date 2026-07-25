import { index, integer, primaryKey, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/** Metadata for public photo-area images. Original image bytes are in R2. */
export const sharedPhotoAreas = sqliteTable(
  "shared_photo_areas",
  {
    sourceId: text("source_id").notNull(),
    boardId: text("board_id").notNull(),
    photoId: text("photo_id").notNull(),
    title: text("title").notNull(),
    eventName: text("event_name"),
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    photoScale: real("photo_scale"),
    spotsJson: text("spots_json").notNull(),
    objectKey: text("object_key").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.sourceId] }),
    uniqueIndex("shared_photo_areas_board_id_idx").on(table.boardId),
    uniqueIndex("shared_photo_areas_photo_id_idx").on(table.photoId),
  ],
);

/** Public planner records. Document IDs keep independent edits from clobbering the whole workspace. */
export const sharedPlannerDocuments = sqliteTable(
  "shared_planner_documents",
  {
    kind: text("kind").notNull(),
    documentId: text("document_id").notNull(),
    documentVersion: integer("document_version").notNull(),
    revision: integer("revision").notNull(),
    payloadJson: text("payload_json").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.kind, table.documentId] }),
    index("shared_planner_documents_updated_at_idx").on(table.updatedAt),
  ],
);

/**
 * The singleton commit record makes every public planner read and write a
 * coherent workspace snapshot instead of a series of independently visible
 * document mutations.
 */
export const sharedPlannerWorkspaces = sqliteTable(
  "shared_planner_workspaces",
  {
    workspaceId: text("workspace_id").notNull(),
    revision: integer("revision").notNull(),
    writeToken: text("write_token").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.workspaceId] })],
);
