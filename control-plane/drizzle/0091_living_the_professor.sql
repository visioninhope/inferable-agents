ALTER TABLE "template_listeners" DROP CONSTRAINT "template_listeners_listener_id_workflow_id_cluster_id";--> statement-breakpoint
ALTER TABLE "template_listeners" ADD CONSTRAINT "template_listeners_listener_id_template_id_cluster_id" PRIMARY KEY("listener_id","cluster_id","template_id");--> statement-breakpoint
ALTER TABLE "listeners" ADD COLUMN "schedule" varchar(1024);
