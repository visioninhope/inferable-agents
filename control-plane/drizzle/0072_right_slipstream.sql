CREATE TABLE IF NOT EXISTS "external_endpoints" (
	"http_endpoint" varchar(1024) NOT NULL,
	"type" text NOT NULL,
	"cluster_id" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_scraped_at" timestamp with time zone,
	"scraped_raw_data" text,
	"generated_definition" json,
	"headers" json,
	CONSTRAINT "external_endpoints_pkey" PRIMARY KEY("cluster_id","http_endpoint","type")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "external_endpoints_cluster_idx" ON "external_endpoints" USING btree ("cluster_id");