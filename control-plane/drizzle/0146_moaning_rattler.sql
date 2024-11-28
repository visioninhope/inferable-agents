CREATE TABLE IF NOT EXISTS "prompt_templates" (
	"id" varchar(1024) NOT NULL,
	"cluster_id" varchar NOT NULL,
	"name" varchar(1024) NOT NULL,
	"prompt" text NOT NULL,
	"tool_constraints" json NOT NULL,
	"structured_output" json NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "prompt_templates_pkey" PRIMARY KEY("cluster_id","id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tool_metadata" (
	"cluster_id" varchar NOT NULL,
	"service" varchar(1024) NOT NULL,
	"function_name" varchar(1024) NOT NULL,
	"user_defined_context" text,
	"result_keys" json DEFAULT '[]'::json,
	CONSTRAINT "tool_metadata_pkey" PRIMARY KEY("cluster_id","service","function_name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prompt_templates" ADD CONSTRAINT "prompt_templates_cluster_id_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."clusters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tool_metadata" ADD CONSTRAINT "tool_metadata_cluster_id_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."clusters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
