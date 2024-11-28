DROP INDEX IF EXISTS "workflowMetadataIndex";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflowMetadataIndex" ON "workflow_metadata" USING btree ("key","value","cluster_id");