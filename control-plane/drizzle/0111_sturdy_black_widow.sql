CREATE TABLE IF NOT EXISTS "service_metadata" (
	"cluster_id" varchar NOT NULL,
	"service" varchar(1024) NOT NULL,
	"status" text NOT NULL,
	"value" text NOT NULL,
	CONSTRAINT "service_metadata_cluster_id_service_key" PRIMARY KEY("cluster_id","service","status")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "service_metadata" ADD CONSTRAINT "service_metadata_cluster_id_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."clusters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
