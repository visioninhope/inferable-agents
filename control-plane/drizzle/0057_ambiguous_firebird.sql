CREATE TABLE IF NOT EXISTS "packaged_integrations" (
	"cluster_id" varchar NOT NULL,
	"package_name" varchar(1024) NOT NULL,
	"version" varchar(1024) DEFAULT 'latest' NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone NOT NULL,
	CONSTRAINT packaged_integrations_cluster_id_package_name PRIMARY KEY("cluster_id","package_name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "packaged_integrations" ADD CONSTRAINT "packaged_integrations_cluster_id_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "clusters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
