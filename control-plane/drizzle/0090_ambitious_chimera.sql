CREATE TABLE IF NOT EXISTS "template_listeners" (
	"listener_id" varchar(1024) NOT NULL,
	"cluster_id" varchar NOT NULL,
	"template_id" varchar(1024) NOT NULL,
	"attached_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "template_listeners_listener_id_workflow_id_cluster_id" PRIMARY KEY("listener_id","cluster_id","template_id")
);
--> statement-breakpoint
ALTER TABLE "workflows" ALTER COLUMN "name" SET DEFAULT '';--> statement-breakpoint
UPDATE "workflows" SET "name" = '' WHERE "name" IS NULL;
ALTER TABLE "workflows" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "template_listeners" ADD CONSTRAINT "template_listeners_listener_id_cluster_id" FOREIGN KEY ("listener_id","cluster_id") REFERENCES "public"."listeners"("id","cluster_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "template_listeners" ADD CONSTRAINT "template_listeners_template_id_cluster_id" FOREIGN KEY ("template_id","cluster_id") REFERENCES "public"."workflow_templates"("id","cluster_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
