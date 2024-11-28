CREATE TABLE IF NOT EXISTS "workflow_affinity" (
	"cluster_id" varchar NOT NULL,
	"service" varchar(1024) NOT NULL,
	"workflow_id" varchar(1024) NOT NULL,
	"external_resource_id" varchar(1024) NOT NULL,
	CONSTRAINT "workflow_affinity_cluster_id_service" PRIMARY KEY("cluster_id","service")
);
