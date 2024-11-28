ALTER TABLE "prompt_templates" RENAME COLUMN "tool_constraints" TO "attached_functions";--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "attached_functions" json;
UPDATE "workflows" SET "attached_functions" = '[]'::json WHERE "attached_functions" IS NULL;