CREATE TABLE `shared_idea_library_workspaces` (
	`workspace_id` text PRIMARY KEY NOT NULL,
	`revision` integer NOT NULL,
	`write_token` text NOT NULL,
	`payload_json` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shared_idea_media` (
	`media_id` text PRIMARY KEY NOT NULL,
	`idea_id` text NOT NULL,
	`media_kind` text NOT NULL,
	`filename` text NOT NULL,
	`mime_type` text NOT NULL,
	`byte_size` integer NOT NULL,
	`width` integer,
	`height` integer,
	`duration_seconds` real,
	`object_key` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `shared_idea_media_idea_id_idx` ON `shared_idea_media` (`idea_id`);