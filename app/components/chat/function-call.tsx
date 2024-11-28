import { client } from "@/client/client";
import { contract } from "@/client/contract";
import {
  SmallDeadGrayCircle,
  SmallDeadGreenCircle,
  SmallDeadRedCircle,
  SmallLiveAmberCircle,
  SmallLiveBlueCircle,
} from "@/components/circles";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { WorkflowJob } from "@/lib/types";
import { unpack } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { ClientInferResponseBody } from "@ts-rest/core";
import { Cpu } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { JsonForm } from "../json-form";
import { Button } from "../ui/button";
import ToolContextButton from "./ToolContextButton";

const statusCircle = (
  status: WorkflowJob["status"],
  resultType: WorkflowJob["resultType"],
) => {
  if (status === "pending") {
    return <SmallLiveAmberCircle />;
  }
  if (status === "success") {
    if (resultType === "rejection") {
      return <SmallDeadRedCircle />;
    }

    return <SmallDeadGreenCircle />;
  }
  if (status === "failure") {
    return <SmallDeadRedCircle />;
  }
  if (status === "stalled") {
    return <SmallDeadGrayCircle />;
  }
  if (status === "running") {
    return <SmallLiveBlueCircle />;
  }
};

function FunctionCall({
  clusterId,
  jobId,
  isFocused,
  onFocusChange,
  service,
  resultType,
  status,
  targetFn,
  approved,
  approvalRequested,
  submitApproval,
}: {
  clusterId: string;
  jobId: string;
  isFocused: boolean;
  onFocusChange: (isFocused: boolean) => void;
  service: string;
  resultType: WorkflowJob["resultType"];
  status: WorkflowJob["status"];
  targetFn: string;
  approved: boolean | null;
  approvalRequested: boolean | null;
  submitApproval: (approved: boolean) => void;
}) {
  const [isExpanded, setExpanded] = useState(isFocused);

  useEffect(() => {
    onFocusChange(isExpanded);
  }, [isExpanded, onFocusChange, setExpanded]);

  useEffect(() => {
    setExpanded(isFocused);
    onFocusChange(isFocused);
  }, [isFocused, onFocusChange, setExpanded]);

  const [editing, setEditing] = useState(false);

  const [job, setJob] = useState<Partial<
    ClientInferResponseBody<typeof contract.getCall>
  > | null>(null);

  const completedWithRejection =
    job?.resultType === "rejection" && job?.status === "success";

  const { getToken } = useAuth();

  const getJobDetail = useCallback(async () => {
    const result = await client.getCall({
      params: {
        callId: jobId,
        clusterId,
      },
      headers: {
        authorization: `Bearer ${await getToken()}`,
      },
    });

    if (result.status === 200) {
      setJob(result.body);
    } else {
      setJob(null);
    }
  }, [jobId, clusterId, getToken]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (editing) {
      getJobDetail();

      interval = setInterval(getJobDetail, 1000);
    }

    return () => {
      interval && clearInterval(interval);
    };
  }, [jobId, clusterId, getToken, getJobDetail, editing]);

  useEffect(() => {
    if (status === "success") {
      getJobDetail();
    }
  }, [status, getJobDetail]);

  return (
    <div className={`mr-2 ml-4`}>
      <Sheet open={editing} onOpenChange={(o) => setEditing(o)}>
        <div>
          <div className="flex flex-row items-center space-x-2">
            <SheetTrigger>
              <Button
                size="sm"
                className={`${approvalRequested && !approved ? "opacity-50" : ""} border bg-transparent border-gray-100 text-black hover:bg-gray-200`}
                asChild
              >
                <div className="flex flex-row items-center text-sm font-mono">
                  <Cpu className="w-4 h-4 mr-2" />
                  <span className="font-mono mr-2">
                    {service}.{targetFn}
                  </span>
                  <span className="">{statusCircle(status, resultType)}</span>
                </div>
              </Button>
            </SheetTrigger>
            <div className="flex items-center gap-2">
              <div
                className={approvalRequested && !approved ? "opacity-50" : ""}
              >
                <ToolContextButton
                  clusterId={clusterId}
                  service={service}
                  functionName={targetFn}
                />
              </div>
              {approvalRequested && !approved && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => submitApproval(true)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => submitApproval(false)}
                  >
                    Deny
                  </Button>
                </div>
              )}
            </div>
            {completedWithRejection && (
              <p className="text-sm text-muted-foreground">
                Inferable was able to run this tool, but it resulted in an
                error.
              </p>
            )}
          </div>
        </div>
        <SheetContent style={{ minWidth: 800 }} className="overflow-scroll">
          <SheetHeader>
            <SheetTitle>
              {service}.{targetFn}()
            </SheetTitle>
            <SheetDescription>{jobId}</SheetDescription>
          </SheetHeader>
          <div className="h-4" />
          <div className="flex flex-col space-y-2 mt-2 text-sm">
            <h1 className="text-sm text-muted-foreground">Metadata</h1>
            <JsonForm
              label="Metadata"
              value={{
                executingMachineId: job?.executingMachineId,
                status: job?.status,
                createdAt: job?.createdAt,
              }}
            />
            <h1 className="text-sm text-muted-foreground">Input</h1>
            {job?.targetArgs && (
              <JsonForm label="Input" value={unpack(job.targetArgs) || {}} />
            )}
            <h1 className="text-sm text-muted-foreground">Result</h1>
            {(job?.result && (
              <JsonForm label="Output" value={unpack(job.result) || {}} />
            )) ||
              "Waiting..."}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default FunctionCall;
