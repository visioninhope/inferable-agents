ALTER TABLE "workflows" ADD COLUMN IF NOT EXISTS "enable_summarization" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "clusters" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp (6) with time zone;
