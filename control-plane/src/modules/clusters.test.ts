import { getClusterContextText } from "./cluster";
import { createCluster, editClusterDetails } from "./management";

describe("clusters", () => {
  it("should strip HTML tags from cluster context", async () => {
    const cluster = await createCluster({
      name: "Test Cluster",
      description: "Test Description",
      organizationId: "test-org-id",
    });

    // Update cluster with HTML content
    await editClusterDetails({
      organizationId: "test-org-id",
      clusterId: cluster.id,
      name: "Test Cluster",
      description: "Test Description",
      additionalContext: {
        current: {
          version: "1",
          content:
            "<h1>Hello</h1><p>This is <strong>formatted</strong> text.</p>",
        },
        history: [],
      },
    });

    // Get the cluster context text
    const contextText = await getClusterContextText(cluster.id);

    // Assert that HTML tags are stripped
    expect(contextText).toBe("HelloThis is formatted text.");
  });

  it("should return the latest version of the context", async () => {
    const cluster = await createCluster({
      name: "Test Cluster",
      description: "Test Description",
      organizationId: "test-org-id",
    });

    // Update cluster with multiple versions
    await editClusterDetails({
      organizationId: "test-org-id",
      clusterId: cluster.id,
      name: "Test Cluster",
      description: "Test Description",
      additionalContext: {
        current: {
          version: "2",
          content: "<p>Version 2 content</p>",
        },
        history: [
          {
            version: "1",
            content: "<p>Version 1 content</p>",
          },
        ],
      },
    });

    // Get the cluster context text
    const contextText = await getClusterContextText(cluster.id);

    // Assert that the latest version is returned
    expect(contextText).toBe("Version 2 content");
  });
});
