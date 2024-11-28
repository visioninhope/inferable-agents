DROP TABLE "predictive_retries_cache";--> statement-breakpoint
ALTER TABLE "clusters" DROP COLUMN IF EXISTS "predictive_retries_enabled";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN IF EXISTS "predictive_retry_enabled";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN IF EXISTS "predicted_to_be_retryable";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN IF EXISTS "predicted_to_be_retryable_reason";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN IF EXISTS "predictive_retry_count";