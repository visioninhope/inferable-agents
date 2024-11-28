CREATE TABLE IF NOT EXISTS "versioned_entities" (
	"id" varchar(1024) NOT NULL,
	"cluster_id" varchar NOT NULL,
	"type" varchar(128) NOT NULL,
	"version" integer NOT NULL,
	"entity" json NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "versioned_entities_pkey" PRIMARY KEY("cluster_id","id","type","version")
);
