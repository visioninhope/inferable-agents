CREATE TABLE IF NOT EXISTS "workflow_interaction_affinity" (
	"cluster_id" varchar NOT NULL,
	"workflow_id" varchar(1024) NOT NULL,
	"service" varchar(1024) NOT NULL,
	"updated_at" timestamp (6) with time zone NOT NULL,
	CONSTRAINT "workflow_interaction_affinity_pk" PRIMARY KEY("cluster_id","workflow_id")
);
