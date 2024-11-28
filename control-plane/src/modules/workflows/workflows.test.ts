import { BadRequestError, RunBusyError } from "../../utilities/errors";
import { createOwner } from "../test/util";
import { insertRunMessage } from "./workflow-messages";
import { assertRunReady, createRun, updateWorkflow } from "./workflows";
import { ulid } from "ulid";

describe("assertWorkflowReady", () => {
  let owner: Awaited<ReturnType<typeof createOwner>>;

  beforeAll(async () => {
    owner = await createOwner();
  });
  it("should succeed if workflow is ready", async () => {
    const workflow = await createRun({
      clusterId: owner.clusterId,
    });

    await expect(
      assertRunReady({
        runId: workflow.id,
        clusterId: owner.clusterId,
      }),
    ).resolves.not.toThrow();
  });

  it("should throw if workflow is running", async () => {
    const workflow = await createRun({
      clusterId: owner.clusterId,
    });

    await updateWorkflow({
      ...workflow,
      status: "running",
    });

    await expect(
      assertRunReady({
        runId: workflow.id,
        clusterId: owner.clusterId,
      }),
    ).rejects.toThrow(RunBusyError);
  });

  it("should throw if run is not interactive", async () => {
    const workflow = await createRun({
      clusterId: owner.clusterId,
      interactive: false,
    });

    await expect(
      assertRunReady({
        runId: workflow.id,
        clusterId: owner.clusterId,
      }),
    ).rejects.toThrow(BadRequestError);
  });

  it("should pass if last message is AI", async () => {
    const workflow = await createRun({
      clusterId: owner.clusterId,
    });

    await insertRunMessage({
      id: ulid(),
      data: {
        message: "Some request",
      },
      type: "human",
      clusterId: owner.clusterId,
      runId: workflow.id,
    });

    await insertRunMessage({
      id: ulid(),
      data: {
        message: "Some response",
      },
      type: "agent",
      clusterId: owner.clusterId,
      runId: workflow.id,
    });

    await updateWorkflow({
      ...workflow,
      status: "done",
    });

    await expect(
      assertRunReady({
        runId: workflow.id,
        clusterId: owner.clusterId,
      }),
    ).resolves.not.toThrow();
  });

  it.each(["human", "template"] as const)(
    "should throw if last message is %s",
    async (type) => {
      const workflow = await createRun({
        clusterId: owner.clusterId,
      });

      await insertRunMessage({
        id: ulid(),
        data: {
          message: "Some request",
        },
        type,
        clusterId: owner.clusterId,
        runId: workflow.id,
      });

      await updateWorkflow({
        ...workflow,
        status: "done",
      });

      await expect(
        assertRunReady({
          runId: workflow.id,
          clusterId: owner.clusterId,
        }),
      ).rejects.toThrow(RunBusyError);
    },
  );

  it.each([
    {
      data: {
        invocations: [
          {
            id: "some-id",
            input: { input: "hello" },
            reasoning: "User requested",
            toolName: "console_echo",
          },
        ],
      },
      type: "agent" as const,
    },
    {
      data: {
        id: "some-id",
        result: {
          data: "some tool message",
        },
      },
      type: "invocation-result" as const,
    },
    {
      data: {
        message: "some system tempalte message",
      },
      type: "template" as const,
    },
  ])("messages should throw unless AI with no tool calls", async (message) => {
    const workflow = await createRun({
      clusterId: owner.clusterId,
    });

    await insertRunMessage({
      id: ulid(),
      data: {
        message: "Some request",
      },
      type: "human",
      clusterId: owner.clusterId,
      runId: workflow.id,
    });

    await insertRunMessage({
      id: ulid(),
      data: {
        message: "Some response",
      },
      type: "agent",
      clusterId: owner.clusterId,
      runId: workflow.id,
    });

    await insertRunMessage({
      ...message,
      id: ulid(),
      runId: workflow.id,
      clusterId: owner.clusterId,
    });

    await updateWorkflow({
      ...workflow,
      status: "done",
    });

    await expect(
      assertRunReady({
        runId: workflow.id,
        clusterId: owner.clusterId,
      }),
    ).rejects.toThrow(RunBusyError);
  });
});
