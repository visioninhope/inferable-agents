import { ulid } from "ulid";
import { embeddableEntitiy, getAllEmbeddings } from "../embeddings/embeddings";

type KnowledgeArtifact = {
  id: string;
  data: string;
  title: string;
};

const knowledgebaseEntity = embeddableEntitiy<KnowledgeArtifact>();

export const createClusterKnowledgeArtifact = async ({
  clusterId,
  artifacts,
}: {
  clusterId: string;
  artifacts: KnowledgeArtifact[];
}) => {
  await knowledgebaseEntity.deleteEmbeddings(
    clusterId,
    "knowledgebase-artifact",
    "knowledgebase",
  );

  for (const artifact of artifacts) {
    await knowledgebaseEntity.embedEntity(
      clusterId,
      "knowledgebase-artifact",
      "knowledgebase",
      ulid(),
      artifact,
    );
  }
};

export const getKnowledge = async ({
  clusterId,
  query,
  limit = 5,
  tag,
}: {
  clusterId: string;
  query: string;
  limit?: number;
  tag?: string;
}) => {
  return knowledgebaseEntity.findSimilarEntities(
    clusterId,
    "knowledgebase-artifact",
    query,
    limit,
    tag,
  );
};

export const getKnowledgeArtifact = async ({
  clusterId,
  id,
}: {
  clusterId: string;
  id: string;
}) => {
  return knowledgebaseEntity.getEntity(clusterId, "knowledgebase-artifact", id);
};

export const upsertKnowledgeArtifact = async ({
  clusterId,
  id,
  data,
  tags,
  title,
}: {
  clusterId: string;
  id: string;
  data: string;
  tags: string[];
  title: string;
}) => {
  await knowledgebaseEntity.deleteEmbedding(
    clusterId,
    "knowledgebase-artifact",
    id,
  );

  return knowledgebaseEntity.embedEntity(
    clusterId,
    "knowledgebase-artifact",
    "knowledgebase",
    id,
    {
      id,
      data,
      title,
    },
    tags,
  );
};

export const deleteKnowledgeArtifact = async ({
  clusterId,
  id,
}: {
  clusterId: string;
  id: string;
}) => {
  return knowledgebaseEntity.deleteEmbedding(
    clusterId,
    "knowledgebase-artifact",
    id,
  );
};

export const getAllKnowledgeArtifacts = async ({
  clusterId,
}: {
  clusterId: string;
}) => {
  return getAllEmbeddings<KnowledgeArtifact>(
    clusterId,
    "knowledgebase-artifact",
  ).then((embeddings) =>
    embeddings.map((embedding) => {
      const { id, data, title } = embedding.data;

      return {
        id,
        data,
        title,
        tags: embedding.tags,
        groupId: embedding.groupId,
      };
    }),
  );
};
