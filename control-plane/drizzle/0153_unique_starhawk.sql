UPDATE "workflows" SET "feedback_score" = 0 WHERE "feedback_score" = 1;
UPDATE "workflows" SET "feedback_score" = 1 WHERE "feedback_score" = 10;

ALTER TABLE "workflows" ALTER COLUMN "feedback_score" SET DATA TYPE numeric;