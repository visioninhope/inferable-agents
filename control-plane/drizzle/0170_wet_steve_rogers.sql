ALTER TABLE "workflows" DROP CONSTRAINT "workflows_job_handle_cluster_id_jobs_id_cluster_id_fk";
--> statement-breakpoint
ALTER TABLE "workflows" DROP COLUMN IF EXISTS "job_handle";