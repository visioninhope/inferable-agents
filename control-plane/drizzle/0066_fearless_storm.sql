ALTER TABLE "embeddings" DROP CONSTRAINT "embeddings_cluster_id_id_pk";--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "embedding_data" SET DATA TYPE vector(1536);--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "embedding_data" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_cluster_id_id_type_pk" PRIMARY KEY("cluster_id","id","type");--> statement-breakpoint
ALTER TABLE "embeddings" ADD COLUMN "raw_data" text NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "embeddingIndex" ON "embeddings" USING hnsw ("embedding_data" vector_cosine_ops);