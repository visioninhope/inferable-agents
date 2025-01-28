import { and, count, eq, isNotNull, lt, sql } from "drizzle-orm";
import { createCache } from "../utilities/cache";
import { NotFoundError } from "../utilities/errors";
import * as cron from "./cron";
import * as data from "./data";
import { toModelInput } from "./prompts";
import { getLatestVersionedText } from "./versioned-text";
import { logger } from "./observability/logger";

export const getClusterDetails = async (clusterId: string) => {
  const [cluster] = await data.db
    .select({
      id: data.clusters.id,
      name: data.clusters.name,
      description: data.clusters.description,
      enable_custom_auth: data.clusters.enable_custom_auth,
      handle_custom_auth_function: data.clusters.handle_custom_auth_function,
      additional_context: data.clusters.additional_context,
      organization_id: data.clusters.organization_id,
      deleted_at: data.clusters.deleted_at,
      is_demo: data.clusters.is_demo,
    })
    .from(data.clusters)
    .where(eq(data.clusters.id, clusterId));

  if (!cluster) {
    throw new NotFoundError(`Cluster not found: ${clusterId}`);
  }

  return cluster;
};


const markEphemeralClustersForDelete = async () => {
  // Find 10 at a time
  const clusters = await data.db
    .update(data.clusters)
    .set({ deleted_at: new Date(), organization_id: null })
    .returning({ id: data.clusters.id })
    .where(
      and(
        eq(data.clusters.is_ephemeral, true),
        lt(data.clusters.created_at, new Date(Date.now() - 1000 * 60 * 60 * 24))
      )
    );

  logger.info("Cleaning up ephemeral clusters", {
    count: clusters.length,
  });
};

const cleanupMarkedClusters = async () => {
  const clusters = await data.db
    .select({
      id: data.clusters.id,
    })
    .from(data.clusters)
    .where(
      and(
        isNotNull(data.clusters.deleted_at),
        lt(data.clusters.deleted_at, new Date(Date.now() - 1000 * 60 * 60 * 24)) // 24 hours
      )
    ).limit(10);

  logger.info("Cleaning up marked clusters", {
    count: clusters.length,
  });

  Promise.all(
    clusters.map(async (cluster) => {
      await deleteCluster(cluster.id);
    })
  );
}

const deleteCluster = async (clusterId: string) => {
  try {
    // Start a transaction
    await data.db.transaction(async (tx) => {
      // Delete from tables in order, ensuring no foreign key violations
      await tx.execute(sql`DELETE FROM "analytics_snapshots" WHERE cluster_id = ${clusterId}`);
      await tx.execute(sql`DELETE FROM "events" WHERE cluster_id = ${clusterId}`);
      await tx.execute(sql`DELETE FROM "agents" WHERE cluster_id = ${clusterId}`);
      await tx.execute(sql`DELETE FROM "versioned_entities" WHERE cluster_id = ${clusterId}`);
      await tx.execute(sql`DELETE FROM "blobs" WHERE cluster_id = ${clusterId}`);
      await tx.execute(sql`DELETE FROM "api_keys" WHERE cluster_id = ${clusterId}`);
      await tx.execute(sql`DELETE FROM "embeddings" WHERE cluster_id = ${clusterId}`);
      await tx.execute(sql`DELETE FROM "run_messages" WHERE cluster_id = ${clusterId}`);
      await tx.execute(sql`DELETE FROM "runs" WHERE cluster_id = ${clusterId}`);
      await tx.execute(sql`DELETE FROM "external_messages" WHERE cluster_id = ${clusterId}`);
      await tx.execute(sql`DELETE FROM "run_tags" WHERE cluster_id = ${clusterId}`);
      await tx.execute(sql`DELETE FROM "integrations" WHERE cluster_id = ${clusterId}`);
      await tx.execute(sql`DELETE FROM "services" WHERE cluster_id = ${clusterId}`);
      await tx.execute(sql`DELETE FROM "machines" WHERE cluster_id = ${clusterId}`);
      await tx.execute(sql`DELETE FROM "jobs" WHERE cluster_id = ${clusterId}`);

      // Finally, delete the cluster itself
      await tx.execute(sql`DELETE FROM "clusters" WHERE id = ${clusterId}`);
    });
  } catch (error) {
    logger.error("Failed to delete cluster and references", {
      clusterId,
      error,
    });
    throw error;
  }
}

const cache = createCache<boolean>(Symbol("clusterExists"));

export const clusterExists = async ({
  organizationId,
  clusterId,
}: {
  organizationId: string;
  clusterId: string;
}): Promise<boolean> => {
  const key = `${organizationId}:${clusterId}`;

  const cached = await cache.get(key);

  if (cached !== undefined) {
    return cached;
  }

  const [cluster] = await data.db
    .select({
      count: count(),
    })
    .from(data.clusters)
    .where(and(eq(data.clusters.id, clusterId), eq(data.clusters.organization_id, organizationId)));

  const exists = cluster.count > 0;
  await cache.set(key, exists, 60);
  return exists;
};

export const getClusterContextText = async (clusterId: string) => {
  const [cluster] = await data.db
    .select({
      additionalContext: data.clusters.additional_context,
    })
    .from(data.clusters)
    .where(eq(data.clusters.id, clusterId));

  // backwards compatibility
  const html =
    typeof cluster.additionalContext === "string"
      ? cluster.additionalContext
      : (getLatestVersionedText(cluster.additionalContext)?.content ?? "");

  return toModelInput(html);
};

export const start = async () => {
  cron.registerCron(markEphemeralClustersForDelete, "cleanup-ephemeral", { interval: 1000 * 60 * 15 }); // 15 minutes
  cron.registerCron(cleanupMarkedClusters, "cleanup-marked", { interval: 1000 * 60 * 15 }); // 15 minutes
};
