CREATE TABLE `shared_planner_documents` (
	`kind` text NOT NULL,
	`document_id` text NOT NULL,
	`document_version` integer NOT NULL,
	`revision` integer NOT NULL,
	`payload_json` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`kind`, `document_id`)
);
--> statement-breakpoint
CREATE INDEX `shared_planner_documents_updated_at_idx` ON `shared_planner_documents` (`updated_at`);