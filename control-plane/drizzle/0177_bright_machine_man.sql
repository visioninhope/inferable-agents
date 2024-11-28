ALTER TABLE "workflows" RENAME COLUMN "system_message" TO "system_prompt";--> statement-breakpoint
ALTER TABLE "prompt_templates" ADD COLUMN "system_prompt" varchar(1024);