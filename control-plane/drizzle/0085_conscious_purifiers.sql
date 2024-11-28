ALTER TABLE "external_integrations" ALTER COLUMN "description" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "external_integrations" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "service" SET DATA TYPE varchar(1024);