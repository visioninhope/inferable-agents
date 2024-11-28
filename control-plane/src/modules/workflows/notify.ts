import * as jobs from "../jobs/jobs";
import { logger } from "../observability/logger";
import { packer } from "../packer";
import { getWorkflowMetadata } from "./metadata";
import { Run } from "./workflows";

export const notifyRunHandler = async ({
  run,
  status,
  result,
}: {
  run: Run;
  status: string;
  result?: unknown;
}) => {
  if (!run.onStatusChange) {
    return;
  }

  // Don't notify if the status hasn't changed
  if (run.status === status) {
    return;
  }

  // TODO: Support for webhooks
  const [resultService, resultFunction] = run.onStatusChange?.split("_") ?? [];

  let notify;

  if (!!resultService && !!resultFunction) {
    notify = async (payload: unknown) => {
      const { id } = await jobs.createJob({
        service: resultService,
        targetFn: resultFunction,
        targetArgs: packer.pack(payload),
        authContext: run.authContext,
        runContext: run.context,
        owner: {
          clusterId: run.clusterId,
        },
      });
      logger.info("Created job with run result", {
        jobId: id,
      });
    };
  }

  if (!notify) {
    logger.warn("Could not determine notification target", {
      onStatusChange: run.onStatusChange,
    });
    return;
  }

  try {
    const metadata = await getWorkflowMetadata({
      clusterId: run.clusterId,
      runId: run.id,
    });

    const payload = {
      runId: run.id,
      status,
      metadata,
      result: result ?? null,
    };

    await notify(payload);
  } catch (error) {
    logger.error("Failed to notify status change", {
      error,
    });
  }
};
