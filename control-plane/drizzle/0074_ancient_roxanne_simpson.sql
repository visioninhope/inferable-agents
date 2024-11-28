ALTER TABLE "events" ALTER COLUMN "service" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "service" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "service" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "workflow_input_requests" ALTER COLUMN "service" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "clusters" ADD COLUMN "name" VARCHAR(1024);--> statement-breakpoint
UPDATE "clusters" SET "name" = "id";--> statement-breakpoint
ALTER TABLE "clusters" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "machines" ADD COLUMN "sdk_version" varchar(128);--> statement-breakpoint
ALTER TABLE "machines" ADD COLUMN "sdk_language" varchar(128);--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "queue_url" varchar(1024);

