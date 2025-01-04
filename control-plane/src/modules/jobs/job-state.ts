import { setup } from "xstate";

export const jobStateMachine = (params: {
  timeoutIntervalSeconds: number;
  remainingAttempts: number;
  lastRetrievedAt: number | null;
}) =>
  setup({
    types: {
      context: {
        remainingAttempts: 1,
        timeoutIntervalSeconds: 300,
        lastRetrievedAt: null as number | null,
      },
    },
  }).createMachine({
    id: "job",
    initial: "pending",
    context: {
      remainingAttempts: params.remainingAttempts,
      timeoutIntervalSeconds: params.timeoutIntervalSeconds,
      lastRetrievedAt: params.lastRetrievedAt,
    },
    states: {
      pending: {
        on: {
          RUN: "running",
          STALL: "stalled",
        },
      },
      running: {
        always: [
          {
            guard: ({ context }) => {
              return context.lastRetrievedAt === null;
            },
            target: "failed", // this should never happen
          },
          {
            guard: ({ context }) =>
              Boolean(
                context.lastRetrievedAt &&
                  Date.now() - context.lastRetrievedAt > params.timeoutIntervalSeconds * 1000
              ),
            target: "stalled",
          },
        ],
        on: {
          COMPLETE: "success",
        },
      },
      stalled: {
        on: {
          ATTEMPT_RECOVER: [
            {
              guard: ({ context }) => context.remainingAttempts > 0,
              target: "pending",
              actions: ({ context }) => {
                context.remainingAttempts--;
              },
            },
            {
              target: "failed",
            },
          ],
        },
      },
      failed: {
        type: "final",
      },
      success: {
        type: "final",
      },
    },
  });
