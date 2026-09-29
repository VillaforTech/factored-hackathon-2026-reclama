CREATE TABLE `demo_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_workspace` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `demo_run_owner` ON `demo_runs` (`owner_workspace`,`id`);