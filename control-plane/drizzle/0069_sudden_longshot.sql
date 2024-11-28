ALTER TABLE "workflow_input_requests" DROP CONSTRAINT "workflow_input_requests_workflow_id_cluster_id_workflows_id_cluster_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflow_input_requests" ADD CONSTRAINT "workflow_input_requests_workflow_id_cluster_id_workflows_id_cluster_id_fk" FOREIGN KEY ("workflow_id","cluster_id") REFERENCES "public"."workflows"("id","cluster_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
