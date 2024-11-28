CREATE TABLE IF NOT EXISTS "workflow_input_requests" (
	"id" varchar(1024) NOT NULL,
	"workflow_id" varchar(1024),
	"cluster_id" varchar NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp (6) with time zone,
	"input" json,
	"type" text NOT NULL,
	CONSTRAINT workflow_input_requests_cluster_id_id PRIMARY KEY("cluster_id","id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflow_input_requests" ADD CONSTRAINT "workflow_input_requests_workflow_id_cluster_id_workflows_id_cluster_id_fk" FOREIGN KEY ("workflow_id","cluster_id") REFERENCES "workflows"("id","cluster_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
