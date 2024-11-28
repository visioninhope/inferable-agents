ALTER TABLE "workflows" ADD COLUMN "job_handle" varchar(1024);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflows" ADD CONSTRAINT "workflows_job_handle_cluster_id_jobs_id_owner_hash_fk" FOREIGN KEY ("job_handle","cluster_id") REFERENCES "public"."jobs"("id","owner_hash") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
