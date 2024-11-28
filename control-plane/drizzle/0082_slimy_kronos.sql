CREATE TABLE IF NOT EXISTS "external_integrations" (
	"id" varchar(1024) NOT NULL,
	"cluster_id" varchar NOT NULL,
	"type" varchar(32) NOT NULL,
	"name" varchar(1024) NOT NULL,
	"description" varchar(1024),
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"config" json NOT NULL,
	CONSTRAINT "external_integrations_id_cluster_id" PRIMARY KEY("id","cluster_id")
);
