import { assign, createActor, setup, Snapshot } from "xstate";

export const jobStateMachine = (params: {
  status: "pending" | "running" | "success" | "failure" | "stalled";
  timeoutIntervalSeconds: number;
  remainingAttempts: number;
  lastRetrievedAt: number;
  hasResult: boolean;
}) =>
  setup({
    types: {
      context: {
        status: params.status,
        remainingAttempts: params.remainingAttempts,
        timeoutIntervalSeconds: params.timeoutIntervalSeconds,
        lastRetrievedAt: params.lastRetrievedAt,
        hasResult: params.hasResult,
      },
    },
  }).createMachine({
    id: "job",
    initial: "running", // we start on the running state because pending jobs are retrieved with SKIP LOCKED with no app in the loop
    context: {
      status: params.status,
      remainingAttempts: params.remainingAttempts,
      timeoutIntervalSeconds: params.timeoutIntervalSeconds,
      lastRetrievedAt: params.lastRetrievedAt,
      hasResult: params.hasResult,
    },
    states: {
      running: {
        always: [
          // time out if we haven't retrieved the job in the timeout interval
          {
            guard: ({ context }) =>
              Boolean(Date.now() - context.lastRetrievedAt > params.timeoutIntervalSeconds * 1000),
            target: "stalled",
            actions: assign(() => ({
              status: "stalled",
            })),
          },
          // if we have a result and not timed out, we're done = success
          {
            guard: ({ context }) => context.hasResult,
            target: "success",
            actions: assign(() => ({
              status: "success",
            })),
          },
        ],
      },
      stalled: {
        always: [
          // if we have attempts left, we're pending
          {
            guard: ({ context }) => context.remainingAttempts > 0,
            target: "pending",
            actions: assign(({ context }) => ({
              status: "pending",
              remainingAttempts: context.remainingAttempts - 1,
              lastRetrievedAt: Date.now(),
              timeoutIntervalSeconds: context.timeoutIntervalSeconds,
            })),
          },
          // if we have no attempts left, we're done = failure
          {
            target: "failure",
            actions: assign(() => ({
              status: "failure",
            })),
          },
        ],
      },
      failure: {
        type: "final",
      },
      success: {
        type: "final",
      },
      // pending is a final state because SKIP LOCKED will take care of the the pending -> running transition
      pending: {
        type: "final",
      },
    },
  });

export async function nextState({
  status,
  timeoutIntervalSeconds,
  remainingAttempts,
  lastRetrievedAt,
  resultType,
  xstateSnapshot,
}: {
  status: "pending" | "running" | "success" | "failure" | "stalled";
  timeoutIntervalSeconds: number;
  remainingAttempts: number;
  lastRetrievedAt: Date;
  resultType: string | null;
  xstateSnapshot: Snapshot<unknown> | null;
}) {
  const machine = jobStateMachine({
    status,
    timeoutIntervalSeconds,
    remainingAttempts,
    lastRetrievedAt: lastRetrievedAt.getTime(),
    hasResult: resultType !== null,
  });

  const actor = createActor(machine, { snapshot: xstateSnapshot ?? undefined });

  actor.start();

  const next = actor.getSnapshot();

  return {
    status: next.value,
    xstate_snapshot: actor.getPersistedSnapshot(),
    remaining_attempts: next.context.remainingAttempts,
    updated_at: new Date(),
  };
}
