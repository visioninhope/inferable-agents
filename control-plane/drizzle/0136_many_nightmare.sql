ALTER TABLE "workflow_templates" ADD COLUMN "version" integer DEFAULT 0 NOT NULL;
ALTER TABLE "workflow_templates" DROP CONSTRAINT "workflow_templates_cluster_id_id";--> statement-breakpoint
ALTER TABLE "workflow_templates" ADD CONSTRAINT "workflow_templates_cluster_id_id_version" PRIMARY KEY("cluster_id","id","version");--> statement-breakpoint