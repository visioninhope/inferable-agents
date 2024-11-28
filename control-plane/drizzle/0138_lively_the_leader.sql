CREATE TABLE IF NOT EXISTS "knowledge_entities" (
	"cluster_id" varchar NOT NULL,
	"learning_id" varchar(1024),
	"type" text,
	"name" varchar(1024),
	CONSTRAINT "knowledge_entities_cluster_id_name_learning_id_pk" PRIMARY KEY("cluster_id","name","learning_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "knowledge_learnings" (
	"id" varchar(1024) NOT NULL,
	"cluster_id" varchar NOT NULL,
	"summary" text NOT NULL,
	"accepted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "knowledge_learnings_cluster_id_id_pk" PRIMARY KEY("cluster_id","id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "knowledge_entities" ADD CONSTRAINT "knowledge_entities_cluster_id_learning_id_knowledge_learnings_cluster_id_id_fk" FOREIGN KEY ("cluster_id","learning_id") REFERENCES "public"."knowledge_learnings"("cluster_id","id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
