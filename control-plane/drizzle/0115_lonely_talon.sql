TRUNCATE TABLE "workflows" CASCADE;
ALTER TABLE "jobs" RENAME COLUMN "owner_hash" TO "cluster_id";--> statement-breakpoint
ALTER TABLE "listeners" DROP CONSTRAINT "listeners_cluster_id";
--> statement-breakpoint
ALTER TABLE "workflows" DROP CONSTRAINT "workflows_job_handle_cluster_id_jobs_id_owner_hash_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx1";--> statement-breakpoint
DROP INDEX IF EXISTS "idx2";--> statement-breakpoint
ALTER TABLE "jobs" DROP CONSTRAINT "jobs_owner_hash_id";--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_cluster_id_id" PRIMARY KEY("cluster_id","id");--> statement-breakpoint
ALTER TABLE "workflow_messages" ADD COLUMN "user_id" varchar(1024) NOT NULL;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "user_id" varchar(1024) NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "listeners" ADD CONSTRAINT "listeners_cluster_id_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."clusters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflows" ADD CONSTRAINT "workflows_job_handle_cluster_id_jobs_id_cluster_id_fk" FOREIGN KEY ("job_handle","cluster_id") REFERENCES "public"."jobs"("id","cluster_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "clusterServiceStatusIndex" ON "jobs" USING btree ("cluster_id","service","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "clusterServiceStatusFnIndex" ON "jobs" USING btree ("cluster_id","service","target_fn","status");--> statement-breakpoint
ALTER TABLE "clusters" DROP COLUMN IF EXISTS "owner_id";--> statement-breakpoint
ALTER TABLE "clusters" DROP COLUMN IF EXISTS "cloud_enabled";--> statement-breakpoint
ALTER TABLE "workflows" DROP COLUMN IF EXISTS "auth_context";
