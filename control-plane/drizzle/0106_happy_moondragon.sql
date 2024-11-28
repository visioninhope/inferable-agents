TRUNCATE TABLE "embeddings";--> statement-breakpoint
DROP INDEX IF EXISTS "embeddingIndex";--> statement-breakpoint
ALTER TABLE "embeddings" ADD COLUMN "model" varchar(1024) NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ADD COLUMN "embedding_1024" vector(1024);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "embedding1024Index" ON "embeddings" USING hnsw ("embedding_1024" vector_cosine_ops);--> statement-breakpoint
ALTER TABLE "embeddings" DROP COLUMN IF EXISTS "embedding_data";
