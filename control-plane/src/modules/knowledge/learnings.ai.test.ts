import { ulid } from "ulid";
import { mergeLearnings } from "./learnings";

describe("mergeLearnings", () => {
  it("should dedeuplicate learnings", async () => {
    const existingLearnings = [
      {
        id: ulid(),
        summary: "Requires authentication before use",
        entities: [
          {
            name: "loadWebpage",
            type: "tool" as const,
          },
        ],
        relevance: {
          temporality: "persistent",
        },
      },
    ];

    const newLearnings = [
      {
        id: ulid(),
        summary: "Needs to be authenticated when used",
        entities: [
          {
            name: "loadWebpage",
            type: "tool" as const,
          },
        ],
        relevance: {
          temporality: "persistent",
        },
      },
      {
        id: ulid(),
        summary: "Can not be called without authentication",
        entities: [
          {
            name: "loadWebpage",
            type: "tool" as const,
          },
        ],
        relevance: {
          temporality: "persistent",
        },
      },
      {
        id: ulid(),
        summary: "Call authenticate before use",
        entities: [
          {
            name: "loadWebpage",
            type: "tool" as const,
          },
        ],
        relevance: {
          temporality: "persistent",
        },
      },
    ];

    const result = await mergeLearnings({
      newLearnings,
      existingLearnings,
      clusterId: "test",
    });

    expect(result).toHaveLength(1);
    expect(result).toEqual(existingLearnings);
  });

  it("should add new learnings", async () => {
    const existingLearnings = [
      {
        id: ulid(),
        summary: "Requires authentication before use",
        entities: [
          {
            name: "loadWebpage",
            type: "tool" as const,
          },
        ],
        relevance: {
          temporality: "persistent",
        },
      },
    ];

    const newLearnings = [
      {
        id: ulid(),
        summary: "Can only be used by administrator users",
        entities: [
          {
            name: "loadWebpage",
            type: "tool" as const,
          },
        ],
        relevance: {
          temporality: "persistent",
        },
      },
      {
        id: ulid(),
        summary: "Can only be called on business days",
        entities: [
          {
            name: "loadWebpage",
            type: "tool" as const,
          },
        ],
        relevance: {
          temporality: "persistent",
        },
      },
    ];

    const result = await mergeLearnings({
      newLearnings,
      existingLearnings,
      clusterId: "test",
    });

    expect(result).toHaveLength(3);
    expect(result).toEqual(existingLearnings.concat(newLearnings));
  });

  it("should merge entities of existing and new learnings", async () => {
    const existingLearnings = [
      {
        id: ulid(),
        summary: "Requires authentication before use",
        entities: [
          {
            name: "loadWebpage",
            type: "tool" as const,
          },
        ],
        relevance: {
          temporality: "persistent",
        },
      },
    ];

    const newLearnings = [
      {
        id: ulid(),
        summary: "Needs to be logged in",
        entities: [
          {
            name: "sendEmail",
            type: "tool" as const,
          },
        ],
        relevance: {
          temporality: "persistent",
        },
      },
    ];

    const result = await mergeLearnings({
      newLearnings,
      existingLearnings,
      clusterId: "test",
    });

    expect(result).toHaveLength(1);
    expect(result).toEqual([
      {
        id: existingLearnings[0].id,
        summary: "Requires authentication before use",
        entities: [
          {
            name: "loadWebpage",
            type: "tool" as const,
          },
          {
            name: "sendEmail",
            type: "tool" as const,
          },
        ],
        relevance: {
          temporality: "persistent",
        },
      },
    ]);
  });
});
