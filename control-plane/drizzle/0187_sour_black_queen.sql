ALTER TABLE "jobs" ADD COLUMN "approval_requested" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "approved" boolean;