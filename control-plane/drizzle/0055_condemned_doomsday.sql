CREATE TABLE IF NOT EXISTS "workflows" (
	"id" varchar(1024) NOT NULL,
	"cluster_id" varchar NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"prompt" text NOT NULL,
	"status" text DEFAULT 'pending',
	CONSTRAINT workflows_cluster_id_id PRIMARY KEY("cluster_id","id")
);
--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "workflow_id" varchar(1024);--> statement-breakpoint
ALTER TABLE "cluster_access_points" DROP COLUMN IF EXISTS "allowed_services_csv";