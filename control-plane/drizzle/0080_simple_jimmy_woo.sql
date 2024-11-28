CREATE TABLE IF NOT EXISTS "listeners" (
	"id" varchar(1024) NOT NULL,
	"cluster_id" varchar NOT NULL,
	"name" varchar(1024) NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "listeners_id_cluster_id" PRIMARY KEY("id","cluster_id"),
	CONSTRAINT "listeners_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflow_listeners" (
	"listener_id" varchar(1024) NOT NULL,
	"cluster_id" varchar NOT NULL,
	"workflow_id" varchar(1024) NOT NULL,
	"attached_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workflow_listeners_listener_id_workflow_id_cluster_id" PRIMARY KEY("listener_id","cluster_id","workflow_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "listeners" ADD CONSTRAINT "listeners_cluster_id" FOREIGN KEY ("cluster_id") REFERENCES "public"."clusters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflow_listeners" ADD CONSTRAINT "workflow_listeners_listener_id_cluster_id" FOREIGN KEY ("listener_id","cluster_id") REFERENCES "public"."listeners"("id","cluster_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflow_listeners" ADD CONSTRAINT "workflow_listeners_workflow_id_cluster_id" FOREIGN KEY ("workflow_id","cluster_id") REFERENCES "public"."workflows"("id","cluster_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflows" ADD CONSTRAINT "workflows_cluster_id_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."clusters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
