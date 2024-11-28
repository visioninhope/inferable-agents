ALTER TABLE "workflow_affinity" DROP CONSTRAINT workflow_affinity_cluster_id_service;
--> statement-breakpoint
ALTER TABLE "workflow_affinity" ADD CONSTRAINT workflow_affinity_cluster_id_service PRIMARY KEY(cluster_id,service,workflow_id);