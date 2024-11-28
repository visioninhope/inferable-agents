ALTER TABLE "events" DROP CONSTRAINT IF EXISTS "events_deployment_id_deployments_id_fk";
ALTER TABLE "events" DROP COLUMN IF EXISTS "deployment_id";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN IF EXISTS "deployment_id";--> statement-breakpoint
ALTER TABLE "machines" DROP COLUMN IF EXISTS "deployment_id";--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN IF EXISTS "preferred_deployment_provider";--> statement-breakpoint

DROP TABLE "deployment_provider_config";--> statement-breakpoint
DROP TABLE "deployment_notifications";--> statement-breakpoint
DROP TABLE "deployments";--> statement-breakpoint
DROP TABLE "client_library_versions";--> statement-breakpoint
DROP TABLE "asset_uploads";--> statement-breakpoint
