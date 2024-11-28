ALTER TABLE "workflows" ALTER COLUMN "attached_functions" SET DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "workflows" ALTER COLUMN "attached_functions" SET NOT NULL;
