ALTER TABLE "workflow_listeners" DROP CONSTRAINT "workflow_listeners_listener_id_cluster_id";
--> statement-breakpoint
ALTER TABLE "workflow_listeners" DROP CONSTRAINT "workflow_listeners_workflow_id_cluster_id";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflow_listeners" ADD CONSTRAINT "workflow_listeners_listener_id_cluster_id" FOREIGN KEY ("listener_id","cluster_id") REFERENCES "public"."listeners"("id","cluster_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflow_listeners" ADD CONSTRAINT "workflow_listeners_workflow_id_cluster_id" FOREIGN KEY ("workflow_id","cluster_id") REFERENCES "public"."workflows"("id","cluster_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
