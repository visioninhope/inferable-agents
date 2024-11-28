UPDATE "workflow_templates" SET "actions" = '[]'::json WHERE "actions" IS NULL;--> statement-breakpoint
ALTER TABLE "workflow_templates" ALTER COLUMN "actions" SET DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "workflow_templates" ALTER COLUMN "actions" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_templates" ADD COLUMN "inputs" json DEFAULT '[]'::json NOT NULL;