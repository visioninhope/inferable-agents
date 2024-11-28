ALTER TABLE "listeners" ADD COLUMN "schedule_data" varchar;--> statement-breakpoint
ALTER TABLE "listeners" ADD COLUMN "next_schedule_at" timestamp (6) with time zone;