ALTER TABLE "integrations" ADD COLUMN "toolhouse" json DEFAULT 'null'::json;--> statement-breakpoint
ALTER TABLE "integrations" ADD COLUMN "langfuse" json;--> statement-breakpoint
ALTER TABLE "integrations" DROP COLUMN IF EXISTS "integration_name";--> statement-breakpoint
ALTER TABLE "integrations" DROP COLUMN IF EXISTS "config";--> statement-breakpoint
ALTER TABLE "integrations" DROP CONSTRAINT IF EXISTS integrations_pkey;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT integrations_pkey PRIMARY KEY(cluster_id);
