CREATE TABLE `planner_local_media` (
	`media_id` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`mime_type` text NOT NULL,
	`byte_size` integer NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`object_key` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
