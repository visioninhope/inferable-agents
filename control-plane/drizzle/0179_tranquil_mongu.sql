ALTER TABLE "prompt_templates" RENAME COLUMN "prompt" TO "initial_prompt";--> statement-breakpoint
ALTER TABLE "workflows" RENAME COLUMN "prompt_template_id" TO "config_id";--> statement-breakpoint
ALTER TABLE "workflows" RENAME COLUMN "prompt_template_version" TO "config_version";