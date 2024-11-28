import { z } from "zod";
import { db, serviceMetadata } from "./data";
import { and, eq } from "drizzle-orm";

const keySchema = z.enum(["incoming-webhook-token"]);

export const storeServiceMetadata = async ({
  clusterId,
  key,
  value,
  service,
}: {
  service: string;
  clusterId: string;
  key: string;
  value: string;
}) => {
  await db
    .insert(serviceMetadata)
    .values([
      {
        service,
        cluster_id: clusterId,
        key: keySchema.parse(key),
        value,
      },
    ])
    .onConflictDoUpdate({
      target: [
        serviceMetadata.cluster_id,
        serviceMetadata.service,
        serviceMetadata.key,
      ],
      set: {
        key: keySchema.parse(key),
        value,
      },
    });
};

export const getServiceMetadata = async ({
  clusterId,
  service,
  key,
}: {
  service: string;
  clusterId: string;
  key: string;
}) => {
  return db
    .select({
      key: serviceMetadata.key,
      value: serviceMetadata.value,
    })
    .from(serviceMetadata)
    .where(
      and(
        eq(serviceMetadata.cluster_id, clusterId),
        eq(serviceMetadata.service, service),
        eq(serviceMetadata.key, keySchema.parse(key)),
      ),
    );
};
