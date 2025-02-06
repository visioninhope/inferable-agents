ALTER TABLE "runs" ADD COLUMN "workflow_execution_id" varchar(1024);--> statement-breakpoint
ALTER TABLE "runs" ADD COLUMN "workflow_version" integer;--> statement-breakpoint
ALTER TABLE "runs" ADD COLUMN "workflow_name" varchar(1024);

-- Custom SQL migration file, put you code below! --

-- First update the runs table with data from tags
UPDATE runs r
SET
  workflow_execution_id = (
    SELECT value
    FROM run_tags rt
    WHERE rt.run_id = r.id
    AND rt.cluster_id = r.cluster_id
    AND rt.key = 'workflow.executionId'
  ),
  workflow_name = (
    SELECT value
    FROM run_tags rt
    WHERE rt.run_id = r.id
    AND rt.cluster_id = r.cluster_id
    AND rt.key = 'workflow.name'
  ),
  workflow_version = (
    SELECT CAST(value AS INTEGER)
    FROM run_tags rt
    WHERE rt.run_id = r.id
    AND rt.cluster_id = r.cluster_id
    AND rt.key = 'workflow.version'
  )
WHERE EXISTS (
  SELECT 1
  FROM run_tags rt
  WHERE rt.run_id = r.id
  AND rt.cluster_id = r.cluster_id
  AND rt.key IN ('workflow.executionId', 'workflow.name', 'workflow.version')
);

-- Then delete the old tags
DELETE FROM run_tags
WHERE key IN ('workflow.executionId', 'workflow.name', 'workflow.version');
