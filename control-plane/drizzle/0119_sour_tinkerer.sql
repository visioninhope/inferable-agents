ALTER TABLE "workflow_input_requests" ALTER COLUMN "service" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_input_requests" ALTER COLUMN "function" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_input_requests" ALTER COLUMN "request_args" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_input_requests" ADD COLUMN "description" varchar(1024);--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN IF EXISTS "json_schema";
