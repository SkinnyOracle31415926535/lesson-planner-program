CREATE TABLE `shared_photo_areas` (
	`source_id` text PRIMARY KEY NOT NULL,
	`board_id` text NOT NULL,
	`photo_id` text NOT NULL,
	`title` text NOT NULL,
	`event_name` text,
	`filename` text NOT NULL,
	`mime_type` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`photo_scale` real,
	`spots_json` text NOT NULL,
	`object_key` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shared_photo_areas_board_id_idx` ON `shared_photo_areas` (`board_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `shared_photo_areas_photo_id_idx` ON `shared_photo_areas` (`photo_id`);