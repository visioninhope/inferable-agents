ALTER TABLE "jobs" ADD COLUMN "xstate_snapshot" json;

CREATE OR REPLACE FUNCTION notify_job_update()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('events.jobs.update', json_build_object('job_id', NEW.id, 'cluster_id', NEW.cluster_id)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_update_trigger
  AFTER UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION notify_job_update();

