ALTER TABLE "external_endpoints" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ADD COLUMN IF NOT EXISTS "group_id" varchar(1024) NOT NULL;--> statement-breakpoint
ALTER TABLE "external_endpoints" DROP CONSTRAINT external_endpoints_pkey;
--> statement-breakpoint
ALTER TABLE "external_endpoints" ADD CONSTRAINT external_endpoints_pkey PRIMARY KEY(cluster_id,name,type);