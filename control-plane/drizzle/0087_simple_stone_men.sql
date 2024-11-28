DO $$ BEGIN
 ALTER TABLE "external_integrations" ADD CONSTRAINT "external_integrations_cluster_id_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."clusters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
