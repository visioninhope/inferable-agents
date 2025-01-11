ALTER TABLE "agents" DROP CONSTRAINT "agents_cluster_id_clusters_id_fk";
--> statement-breakpoint
ALTER TABLE "api_keys" DROP CONSTRAINT "api_keys_cluster_id_clusters_id_fk";
--> statement-breakpoint
ALTER TABLE "external_messages" DROP CONSTRAINT "external_messages_message_id_run_id_cluster_id_workflow_messages_id_workflow_id_cluster_id_fk";
--> statement-breakpoint
ALTER TABLE "integrations" DROP CONSTRAINT "integrations_cluster_id_clusters_id_fk";
--> statement-breakpoint
ALTER TABLE "workflows" DROP CONSTRAINT "workflows_cluster_id_clusters_id_fk";
--> statement-breakpoint
ALTER TABLE "services" DROP CONSTRAINT "services_cluster_id_clusters_id_fk";
--> statement-breakpoint
ALTER TABLE "workflows" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agents" ADD CONSTRAINT "agents_cluster_id_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."clusters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_cluster_id_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."clusters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "external_messages" ADD CONSTRAINT "external_messages_message_id_run_id_cluster_id_workflow_messages_id_workflow_id_cluster_id_fk" FOREIGN KEY ("message_id","run_id","cluster_id") REFERENCES "public"."workflow_messages"("id","workflow_id","cluster_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "integrations" ADD CONSTRAINT "integrations_cluster_id_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."clusters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflows" ADD CONSTRAINT "workflows_cluster_id_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."clusters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "services" ADD CONSTRAINT "services_cluster_id_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."clusters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
