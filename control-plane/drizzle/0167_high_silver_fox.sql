ALTER TABLE "embeddings" ADD COLUMN "tags" json;--> statement-breakpoint
ALTER TABLE "workflows" DROP COLUMN IF EXISTS "parent_workflow_id";