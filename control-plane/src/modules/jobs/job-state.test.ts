import { jobStateMachine } from "./job-state";
import { createActor } from "xstate";

describe("jobStateMachine", () => {
  const defaultParams = {
    timeoutIntervalSeconds: 300,
    remainingAttempts: 3,
    lastRetrievedAt: null,
  };

  it("should start in pending state", () => {
    const machine = jobStateMachine(defaultParams);
    const actor = createActor(machine);
    actor.start();

    expect(actor.getSnapshot().value).toBe("pending");
  });

  it("should transition from pending to running", () => {
    const machine = jobStateMachine({
      ...defaultParams,
      lastRetrievedAt: Date.now(),
    });
    const actor = createActor(machine);
    actor.start();

    actor.send({ type: "RUN" });

    expect(actor.getSnapshot().value).toBe("running");
  });

  it("should transition to success on completion", () => {
    const machine = jobStateMachine({
      ...defaultParams,
      lastRetrievedAt: Date.now(),
    });
    const actor = createActor(machine);
    actor.start();

    actor.send({ type: "RUN" });
    actor.send({ type: "COMPLETE" });
    expect(actor.getSnapshot().value).toBe("success");
  });

  it("should transition to stalled when timeout exceeded", () => {
    const now = Date.now();
    const timeoutMs = 1000;

    const timeoutIntervalSeconds = timeoutMs / 1000;
    const machine = jobStateMachine({
      ...defaultParams,
      timeoutIntervalSeconds,
      lastRetrievedAt: now - timeoutMs - 1,
    });
    const actor = createActor(machine);
    actor.start();

    actor.send({ type: "RUN" });
    expect(actor.getSnapshot().value).toBe("stalled");
  });

  it("should attempt recovery when stalled with remaining attempts", () => {
    const machine = jobStateMachine(defaultParams);
    const actor = createActor(machine);
    actor.start();

    actor.send({ type: "STALL" });
    actor.send({ type: "ATTEMPT_RECOVER" });

    expect(actor.getSnapshot().value).toBe("pending");
    expect(actor.getSnapshot().context.remainingAttempts).toBe(2);
  });

  it("should transition to failed when no recovery attempts remain", () => {
    const machine = jobStateMachine({
      ...defaultParams,
      remainingAttempts: 1,
    });
    const actor = createActor(machine);
    actor.start();

    actor.send({ type: "STALL" });
    actor.send({ type: "ATTEMPT_RECOVER" });
    actor.send({ type: "STALL" });
    actor.send({ type: "ATTEMPT_RECOVER" });

    expect(actor.getSnapshot().value).toBe("failed");
  });

  it("should fail if lastRetrievedAt is null in running state", () => {
    const machine = jobStateMachine({
      ...defaultParams,
      lastRetrievedAt: null,
    });
    const actor = createActor(machine);
    actor.start();

    actor.send({ type: "RUN" });

    expect(actor.getSnapshot().value).toBe("failed");
  });
});
