CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS "embeddings" (
	"id" varchar(1024) NOT NULL,
	"cluster_id" varchar NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"type" text NOT NULL,
	"embedding_data" vector(3072),
	CONSTRAINT "embeddings_cluster_id_id_pk" PRIMARY KEY("cluster_id","id")
);

--> statement-breakpoint
DROP INDEX IF EXISTS "idx1";--> statement-breakpoint
DROP INDEX IF EXISTS "idx2";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx1" ON "jobs" USING btree ("owner_hash","service","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx2" ON "jobs" USING btree ("owner_hash","service","target_fn","status");
