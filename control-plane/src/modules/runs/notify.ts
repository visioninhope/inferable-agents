import { InferSelectModel } from "drizzle-orm";
import * as jobs from "../jobs/jobs";
import { logger } from "../observability/logger";
import { packer } from "../packer";
import { getRunTags } from "./tags";
import { getClusterBackgroundRun } from "./";
import { runMessages } from "../data";
import * as slack from "../integrations/slack";
import * as email from "../email";
import AsyncRetry from "async-retry";
import {
  isWorkflowExecutionTarget,
  onWorkflowExecutionRunStatusChange,
} from "../workflow-definitions/executor";
import { runWorkflowQueue } from "../queues/run-workflow";

export const notifyApprovalRequest = async ({
  jobId,
  clusterId,
  runId,
  service,
  targetFn,
}: {
  jobId: string;
  clusterId: string;
  runId: string;
  service: string;
  targetFn: string;
}) => {
  const tags = await getRunTags({ clusterId, runId });
  await slack.handleApprovalRequest({ jobId, clusterId, runId, service, targetFn, tags });
  await email.handleApprovalRequest({ jobId, clusterId, runId, service, targetFn, tags });
};

export const notifyNewMessage = async ({
  message,
  tags,
}: {
  message: {
    id: string;
    clusterId: string;
    runId: string;
    type: InferSelectModel<typeof runMessages>["type"];
    data: InferSelectModel<typeof runMessages>["data"];
  };
  tags?: Record<string, string>;
}) => {
  await slack.notifyNewMessage({ message, tags });
  await email.notifyNewMessage({ message, tags });
};

export const notifyStatusChange = async ({
  run,
  status,
  result,
}: {
  run: {
    id: string;
    clusterId: string;
    onStatusChange: string | null;
    onStatusChangeStatuses: string[] | null;
    status: string;
    authContext: unknown;
    context: unknown;
  };
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

  // Don't notify if the status is not in the allowed list
  if (run.onStatusChangeStatuses && !run.onStatusChangeStatuses.includes(status)) {
    return;
  }

  let notify;
  if (run.onStatusChange.startsWith("https://")) {
    notify = async (payload: unknown) => {
      await AsyncRetry(
        async (_, attempt: number) => {
          logger.info("Sending status change webhook", {
            url: run.onStatusChange,
            attempt,
          });

          return await fetch(run.onStatusChange!, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
        },
        {
          retries: 5,
        }
      );
    };
  } else if (isWorkflowExecutionTarget(run.onStatusChange)) {
    notify = async () => {
      await onWorkflowExecutionRunStatusChange(run.onStatusChange!, status);
    };
  } else {
    const [resultService, resultFunction] = run.onStatusChange?.split("_") ?? [];

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
          runId: getClusterBackgroundRun(run.clusterId),
        });
        logger.info("Created job with run result", {
          jobId: id,
        });
      };
    }
  }

  if (!notify) {
    logger.warn("Could not determine notification target", {
      onStatusChange: run.onStatusChange,
    });
    return;
  }

  try {
    const tags = await getRunTags({
      clusterId: run.clusterId,
      runId: run.id,
    });

    const payload = {
      runId: run.id,
      status,
      tags,
      result: result ?? null,
    };

    await notify(payload);
  } catch (error) {
    logger.error("Failed to notify status change", {
      error,
    });
  }
};
