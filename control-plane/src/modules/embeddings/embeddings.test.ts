import {
  embedEntity,
  findSimilarEntities,
  getAllUniqueTags,
} from "./embeddings";

describe("embeddings", () => {
  const clusterId = Math.random().toString();

  const entities = [
    {
      service: "orders",
      function: "create",
    },
    {
      service: "burger",
      function: "create",
    },
    {
      service: "orders",
      function: "createDelivery",
    },
    {
      service: "customer",
      function: "getAddress",
    },
    {
      service: "ip",
      function: "get",
    },
    {
      service: "orders",
      function: "refundFull",
    },
    {
      service: "orders",
      function: "refundPartial",
    },
  ];

  it("should embed and search entities", async () => {
    await Promise.all(
      entities.map(async (entity) => {
        await embedEntity(
          clusterId,
          "service-function",
          entity.service,
          `${entity.service}_${entity.function}`,
          entity,
          [entity.service],
        );
      }),
    );

    const results = await findSimilarEntities<{
      service: string;
      function: string;
    }>(clusterId, "service-function", "deliver food to customer location", 5);

    expect(
      results.find(
        (r) => r.service === "orders" && r.function === "createDelivery",
      ),
    ).toBeDefined();

    expect(
      results.find(
        (r) => r.service === "customer" && r.function === "getAddress",
      ),
    ).toBeDefined();
  });

  it("should get all unique tags", async () => {
    const tags = await getAllUniqueTags(clusterId, "service-function");
    expect(tags.sort()).toEqual(["burger", "customer", "ip", "orders"]);
  });
});
