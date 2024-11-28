import { ulid } from "ulid";
import { getKnowledge, upsertKnowledgeArtifact } from "./knowledgebase";

describe("knowledgebase", () => {
  it("should be able to upsert knowledge artifacts and get similar entities", async () => {
    const clusterId = ulid();

    const fakeArtifacts = [
      {
        id: ulid(),
        data: "Elon Musk is the pontiac bandit.",
        tags: ["tesla", "spacex", "person"],
        title: "Fake Artifact 1",
      },
      {
        id: ulid(),
        data: "Elvis has left the building.",
        tags: ["music", "rock", "person"],
        title: "Fake Artifact 2",
      },
      {
        id: ulid(),
        data: "The quick brown fox jumps over the lazy dog.",
        tags: ["dog", "fox", "animal"],
        title: "Fake Artifact 3",
      },
    ];

    for (const artifact of fakeArtifacts) {
      await upsertKnowledgeArtifact({
        clusterId,
        id: artifact.id,
        data: artifact.data,
        tags: artifact.tags,
        title: artifact.title,
      });
    }

    // search for similar entities by query
    const results = await getKnowledge({
      clusterId,
      query: "Elon Musk",
    });

    expect(results[0].id).toBe(fakeArtifacts[0].id);

    // search for similar entities by tags
    const resultsByTags = await getKnowledge({
      clusterId,
      query: "music",
      tag: "music",
    });

    expect(resultsByTags.length).toBe(1);
    expect(resultsByTags[0].id).toBe(fakeArtifacts[1].id);

    // search for similar entities that yield multiple results
    const resultsMultiple = await getKnowledge({
      clusterId,
      query: "",
      tag: "person",
    });

    expect(resultsMultiple.length).toBe(2);
    expect(resultsMultiple.map((r) => r.id)).toEqual(
      expect.arrayContaining([fakeArtifacts[0].id, fakeArtifacts[1].id]),
    );
  });
});
