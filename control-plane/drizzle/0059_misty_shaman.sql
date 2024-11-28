ALTER TABLE "workflow_input_requests" DROP CONSTRAINT "workflow_input_requests_cluster_id_id";--> statement-breakpoint
ALTER TABLE "workflow_input_requests" ADD CONSTRAINT "workflow_input_requests_workflow_id_id" PRIMARY KEY("workflow_id","id");
