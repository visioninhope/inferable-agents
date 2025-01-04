import { jobStateMachine } from "./job-state";
import { createActor } from "xstate";

describe("jobStateMachine", () => {
  const defaultParams = {
    status: "pending" as const,
    timeoutIntervalSeconds: 300,
    remainingAttempts: 3,
    lastRetrievedAt: Date.now(),
    hasResult: false,
  };

  it("should start in running state", () => {
    const machine = jobStateMachine(defaultParams);
    const actor = createActor(machine);
    actor.start();

    expect(actor.getSnapshot().value).toBe("running");
  });

  it("should stay in running when timeout hasn't been exceeded and no result", () => {
    const now = Date.now();
    const timeoutMs = 1000;

    const machine = jobStateMachine({
      ...defaultParams,
      timeoutIntervalSeconds: timeoutMs / 1000,
      lastRetrievedAt: now - timeoutMs / 2, // Half the timeout
      hasResult: false,
    });
    const actor = createActor(machine);
    actor.start();

    expect(actor.getSnapshot().value).toBe("running");
  });

  it("should transition to success when result is available", () => {
    const machine = jobStateMachine({
      ...defaultParams,
      hasResult: true,
    });
    const actor = createActor(machine);
    actor.start();

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

    expect(actor.getSnapshot().value).toBe("stalled");
  });

  it("should transition to pending when stalled with remaining attempts", () => {
    const now = Date.now();
    const timeoutMs = 1000;

    const machine = jobStateMachine({
      ...defaultParams,
      timeoutIntervalSeconds: timeoutMs / 1000,
      lastRetrievedAt: now - timeoutMs - 1,
      remainingAttempts: 2,
    });
    const actor = createActor(machine);
    actor.start();

    expect(actor.getSnapshot().value).toBe("pending");
    expect(actor.getSnapshot().context.remainingAttempts).toBe(1);
  });

  it("should transition to failed when stalled with no remaining attempts", () => {
    const now = Date.now();
    const timeoutMs = 1000;

    const machine = jobStateMachine({
      ...defaultParams,
      timeoutIntervalSeconds: timeoutMs / 1000,
      lastRetrievedAt: now - timeoutMs - 1,
      remainingAttempts: 0,
    });
    const actor = createActor(machine);
    actor.start();

    expect(actor.getSnapshot().value).toBe("failure");
  });
});
