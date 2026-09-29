CREATE TABLE `attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`operation` text NOT NULL,
	`result` text NOT NULL,
	`latency_ms` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `audit` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`case_id` text NOT NULL,
	`event` text NOT NULL,
	`actor` text NOT NULL,
	`version` integer NOT NULL,
	`created_at` text NOT NULL,
	`detail` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cases` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`customer_id` text NOT NULL,
	`transaction_id` text NOT NULL,
	`draft_id` text NOT NULL,
	`reason` text NOT NULL,
	`statement` text NOT NULL,
	`facts` text NOT NULL,
	`status` text NOT NULL,
	`kind` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`payload_hash` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`last_actor` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `case_idempotency` ON `cases` (`workspace`,`idempotency_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `case_transaction` ON `cases` (`workspace`,`customer_id`,`transaction_id`);--> statement-breakpoint
CREATE TABLE `drafts` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`workspace` text NOT NULL,
	`customer_id` text NOT NULL,
	`transaction_id` text NOT NULL,
	`reason` text NOT NULL,
	`statement` text NOT NULL,
	`token` text NOT NULL,
	`facts_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`customer_id` text NOT NULL,
	`role` text NOT NULL,
	`locale` text NOT NULL,
	`expires_at` integer NOT NULL,
	`fault` text
);
--> statement-breakpoint
CREATE TRIGGER audit_case_received AFTER INSERT ON cases BEGIN INSERT INTO audit(case_id,event,actor,version,created_at,detail) VALUES(NEW.id,'case_received',NEW.last_actor,NEW.version,NEW.created_at,NEW.kind); END;
--> statement-breakpoint
CREATE TRIGGER audit_case_updated AFTER UPDATE ON cases BEGIN INSERT INTO audit(case_id,event,actor,version,created_at,detail) VALUES(NEW.id,'review_updated',NEW.last_actor,NEW.version,NEW.updated_at,NEW.status); END;
