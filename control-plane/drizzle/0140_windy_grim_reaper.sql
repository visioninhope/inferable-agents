CREATE TABLE IF NOT EXISTS "api_keys" (
	"id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"cluster_id" varchar NOT NULL,
	"secret_hash" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	CONSTRAINT "api_keys_cluster_id_id_pk" PRIMARY KEY("cluster_id","id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_cluster_id_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."clusters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "api_keys_secret_hash_index" ON "api_keys" USING btree ("secret_hash");
