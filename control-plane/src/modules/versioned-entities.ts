import { sql } from "drizzle-orm";
import { versionedEntities } from "./data";
import { db } from "./data";
import { and, eq, lt } from "drizzle-orm";
import { z } from "zod";

export const createVersionedEntity = async <T>(
  clusterId: string,
  id: string,
  type: string,
  entity: T,
) => {
  const [created] = await db
    .insert(versionedEntities)
    .values({
      cluster_id: clusterId,
      id,
      type,
      entity,
      version: sql`(select coalesce(max(version), 0) from ${versionedEntities} where cluster_id = ${clusterId} and id = ${id} and type = ${type}) + 1`,
    })
    .returning({
      version: versionedEntities.version,
    });

  const version = created.version;

  await db
    .delete(versionedEntities)
    .where(
      and(
        eq(versionedEntities.cluster_id, clusterId),
        eq(versionedEntities.id, id),
        eq(versionedEntities.type, type),
        lt(versionedEntities.version, version - 10),
      ),
    );

  return version;
};

export const getVersionedEntities = async <T>(
  clusterId: string,
  id: string,
  type: string,
) => {
  const entities = await db
    .select()
    .from(versionedEntities)
    .where(
      and(
        eq(versionedEntities.cluster_id, clusterId),
        eq(versionedEntities.id, id),
        eq(versionedEntities.type, type),
      ),
    );

  return entities.map((e) => {
    return {
      ...e,
      entity: e.entity as T,
    };
  });
};

export class VersionedEntity<T> {
  constructor(
    private readonly zodSchema: z.ZodSchema<T>,
    private readonly type: string,
  ) {}

  async get(clusterId: string, id: string) {
    const entities = await getVersionedEntities(clusterId, id, this.type);

    return entities.map((e) => {
      return {
        ...e,
        entity: this.zodSchema.parse(e.entity),
      };
    });
  }

  async create(clusterId: string, id: string, entity: T) {
    const parsedEntity = this.zodSchema.parse(entity);
    const version = await createVersionedEntity(
      clusterId,
      id,
      this.type,
      parsedEntity,
    );
    return version;
  }
}
