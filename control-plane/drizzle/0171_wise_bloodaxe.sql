ALTER TABLE "jobs" ADD COLUMN "customer_auth_context" json;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "customer_auth_context" json;--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN IF EXISTS "auth_context";
