CREATE TABLE `shared_planner_workspaces` (
	`workspace_id` text PRIMARY KEY NOT NULL,
	`revision` integer NOT NULL,
	`write_token` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
