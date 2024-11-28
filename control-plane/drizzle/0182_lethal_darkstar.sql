ALTER TABLE "workflows" RENAME COLUMN "customer_auth_context" TO "auth_context";--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "run_context" json;