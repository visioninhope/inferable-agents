ALTER TABLE "workflow_messages" DROP COLUMN IF EXISTS "data";--> statement-breakpoint
ALTER TABLE "workflow_messages" DROP COLUMN IF EXISTS "message";--> statement-breakpoint
ALTER TABLE "workflow_messages" DROP COLUMN IF EXISTS "subtype";--> statement-breakpoint
TRUNCATE table "workflow_messages" CASCADE;--> statement-breakpoint
ALTER TABLE "workflow_messages" ADD COLUMN "data" json NOT NULL;
