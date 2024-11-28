ALTER TABLE "workflow_input_requests" RENAME COLUMN "input" TO "request_args";--> statement-breakpoint
ALTER TABLE "workflow_input_requests" RENAME COLUMN "call_identifier" TO "request_identifier";--> statement-breakpoint
ALTER TABLE "workflow_input_requests" ALTER COLUMN "request_args" SET DATA TYPE text;--> statement-breakpoint
