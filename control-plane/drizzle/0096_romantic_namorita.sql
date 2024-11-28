DROP TABLE "external_endpoints";--> statement-breakpoint
DROP TABLE "packaged_integrations";--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "template_id" varchar(1024);