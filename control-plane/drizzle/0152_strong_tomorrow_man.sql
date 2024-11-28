ALTER TABLE "workflows" ADD COLUMN IF NOT EXISTS "prompt_template_id" varchar(128);--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN IF NOT EXISTS "prompt_template_version" integer;--> statement-breakpoint
ALTER TABLE "workflows" DROP COLUMN IF EXISTS "template_id";