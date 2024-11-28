ALTER TABLE "workflow_messages" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "workflow_messages" ADD COLUMN "data" text;