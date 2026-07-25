import { integer, primaryKey, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

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
