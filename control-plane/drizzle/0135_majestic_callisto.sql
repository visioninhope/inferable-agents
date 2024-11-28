ALTER TABLE "clusters" ADD COLUMN "additional_context_bak" text;

UPDATE "clusters" SET "additional_context_bak" = "additional_context";

ALTER TABLE "clusters" ALTER COLUMN "additional_context" TYPE json USING '{}';

UPDATE "clusters"
SET "additional_context" = json_build_object(
  'current', json_build_object(
    'version', '1',
    'content', "additional_context_bak"
  ),
  'history', '[]'::json
)
WHERE "additional_context_bak" IS NOT NULL;

-- DROP this column in a future migration
-- ALTER TABLE "clusters" DROP COLUMN "additional_context_bak";