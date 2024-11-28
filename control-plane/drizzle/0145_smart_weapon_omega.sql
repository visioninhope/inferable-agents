CREATE TABLE IF NOT EXISTS "blobs" (
	"id" varchar(1024) NOT NULL,
	"name" varchar(1024) NOT NULL,
	"cluster_id" varchar NOT NULL,
	"workflow_id" varchar(1024),
	"job_id" varchar(1024),
	"data" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"encoding" varchar(1024) NOT NULL,
	"type" varchar(1024) NOT NULL,
	"size" integer NOT NULL,
	CONSTRAINT "blobs_cluster_id_id_pk" PRIMARY KEY("cluster_id","id")
);
--> statement-breakpoint
ALTER TABLE "machines" ALTER COLUMN "last_ping_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "machines" ALTER COLUMN "ip" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blobs" ADD CONSTRAINT "blobs_cluster_id_job_id_jobs_cluster_id_id_fk" FOREIGN KEY ("cluster_id","job_id") REFERENCES "public"."jobs"("cluster_id","id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blobs" ADD CONSTRAINT "blobs_cluster_id_workflow_id_workflows_cluster_id_id_fk" FOREIGN KEY ("cluster_id","workflow_id") REFERENCES "public"."workflows"("cluster_id","id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
