CREATE TABLE IF NOT EXISTS "workflow_execution" (
	"id" varchar(1024) NOT NULL,
	"cluster_id" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"workflow_definition_id" varchar(1024) NOT NULL,
	"workflow_definition_version" integer NOT NULL,
	"workflow_definition_json" json NOT NULL,
	"input" json,
	"output" json,
	CONSTRAINT "workflow_execution_pkey" PRIMARY KEY("cluster_id","id")
);
