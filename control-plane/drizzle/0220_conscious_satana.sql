CREATE TABLE IF NOT EXISTS "workflow_definitions" (
	"id" varchar(1024) NOT NULL,
	"cluster_id" varchar NOT NULL,
	"description" varchar(1024) NOT NULL,
	"yaml" text NOT NULL,
	"json" json NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" integer NOT NULL,
	CONSTRAINT "workflow_definitions_pkey" PRIMARY KEY("cluster_id","id","version")
);
