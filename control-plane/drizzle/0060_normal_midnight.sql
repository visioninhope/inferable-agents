ALTER TABLE "workflow_input_requests" ALTER COLUMN "workflow_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_input_requests" ADD COLUMN "service" varchar(1024) NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_input_requests" ADD COLUMN "function" varchar(1024) NOT NULL;