CREATE TABLE IF NOT EXISTS "workflow_metadata" (
	"cluster_id" varchar NOT NULL,
	"workflow_id" varchar(1024) NOT NULL,
	"key" varchar(1024) NOT NULL,
	"value" text NOT NULL,
	CONSTRAINT "workflow_metadata_cluster_id_workflow_id_key" PRIMARY KEY("cluster_id","workflow_id","key")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflow_metadata" ADD CONSTRAINT "workflow_metadata_workflow_id_cluster_id_workflows_id_cluster_id_fk" FOREIGN KEY ("workflow_id","cluster_id") REFERENCES "public"."workflows"("id","cluster_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflowMetadataIndex" ON "workflow_metadata" USING btree ("key","cluster_id");