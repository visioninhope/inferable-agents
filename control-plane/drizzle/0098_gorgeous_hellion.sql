CREATE TABLE IF NOT EXISTS "workflow_messages" (
	"id" varchar(1024) NOT NULL,
	"cluster_id" varchar NOT NULL,
	"workflow_id" varchar(1024) NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"message" text NOT NULL,
	"type" text NOT NULL,
	CONSTRAINT "workflow_messages_cluster_id_id" PRIMARY KEY("cluster_id","id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflow_messages" ADD CONSTRAINT "workflow_messages_workflow_id_cluster_id_workflows_id_cluster_id_fk" FOREIGN KEY ("workflow_id","cluster_id") REFERENCES "public"."workflows"("id","cluster_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
