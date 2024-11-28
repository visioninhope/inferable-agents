ALTER TABLE "clusters" ADD COLUMN "enable_run_configs" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "clusters" ADD COLUMN "enable_knowledgebase" boolean DEFAULT false NOT NULL;