CREATE TABLE IF NOT EXISTS "workflow_templates" (
	"id" varchar(1024) NOT NULL,
	"cluster_id" varchar NOT NULL,
	"name" varchar(1024) NOT NULL,
	"description" varchar(1024),
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"initial_instructions" text NOT NULL,
	"integration_id" varchar(1024),
	CONSTRAINT "workflow_templates_cluster_id_id" PRIMARY KEY("cluster_id","id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflow_templates" ADD CONSTRAINT "workflow_templates_cluster_id_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."clusters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
