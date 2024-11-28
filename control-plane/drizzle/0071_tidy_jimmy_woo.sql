UPDATE "workflow_input_requests" SET "request_args" = '' WHERE "request_args" IS NULL;
ALTER TABLE "workflow_input_requests" ALTER COLUMN "request_args" SET NOT NULL;
