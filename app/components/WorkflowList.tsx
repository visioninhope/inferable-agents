"use client";

import { client } from "@/client/client";
import { contract } from "@/client/contract";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { createErrorToast } from "@/lib/utils";
import { useAuth, useUser } from "@clerk/nextjs";
import { ClientInferResponseBody } from "@ts-rest/core";
import { PlayIcon, PlusIcon, UserIcon, XIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { PromptTextarea } from "./chat/prompt-textarea";
import { Badge } from "./ui/badge";
import { RunTab } from "./workflow-tab";
import { ServerConnectionStatus } from "./server-connection-pane";

type WorkflowListProps = {
  clusterId: string;
};

const runFiltersSchema = z.object({
  configId: z.string().optional(),
  test: z.boolean().optional(),
});

export function RunList({ clusterId }: WorkflowListProps) {
  const router = useRouter();
  const { getToken, userId } = useAuth();
  const user = useUser();
  const [runToggle, setRunToggle] = useState("all");
  const [limit, setLimit] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const [workflows, setWorkflows] = useState<
    ClientInferResponseBody<typeof contract.listRuns, 200>
  >([]);
  const [showNewRn, setShowNewRun] = useState(false);
  const goToCluster = useCallback(
    (c: string) => {
      router.push(`/clusters/${c}/runs`);
    },
    [router],
  );

  const goToWorkflow = useCallback(
    (c: string, w: string) => {
      router.push(`/clusters/${c}/runs/${w}`);
    },
    [router],
  );

  const searchParams = useSearchParams();
  const runFiltersQuery = searchParams?.get("filters");

  const [runFilters, setRunFilters] = useState<
    z.infer<typeof runFiltersSchema>
  >({});
  const path = usePathname();

  useEffect(() => {
    if (!runFiltersQuery) {
      return;
    }

    const parsedFilters = runFiltersSchema.safeParse(
      JSON.parse(runFiltersQuery),
    );
    if (parsedFilters.success) {
      setRunFilters(parsedFilters.data);
    } else {
      createErrorToast(parsedFilters.error, "Invalid filters specified");
    }
  }, [runFiltersQuery]);

  const fetchWorkflows = useCallback(async () => {
    if (!clusterId || !user.isLoaded) {
      return;
    }

    const result = await client.listRuns({
      headers: {
        authorization: `Bearer ${await getToken()}`,
      },
      query: {
        test: runFilters.test ? "true" : undefined,
        userId: (runToggle === "mine" ? userId : undefined) ?? undefined,
        limit: Math.min(limit, 500), // Ensure limit doesn't exceed 500
        configId: runFilters.configId,
      },
      params: {
        clusterId: clusterId,
      },
    });

    if (result.status === 200) {
      setWorkflows(result.body);
      setHasMore(result.body.length === limit && limit < 50);
    } else {
      ServerConnectionStatus.addEvent({
        type: "listRuns",
        success: false,
      });
    }
  }, [
    clusterId,
    getToken,
    runToggle,
    userId,
    user.isLoaded,
    limit,
    runFilters,
  ]);

  useEffect(() => {
    if (runFilters?.configId) {
      fetchWorkflows();
    }
  }, [runFilters?.configId, fetchWorkflows]);

  useEffect(() => {
    fetchWorkflows();
    const interval = setInterval(fetchWorkflows, 5000);
    return () => clearInterval(interval);
  }, [fetchWorkflows, runFilters?.configId]);

  const loadMore = () => {
    if (limit < 50) {
      setLimit((prevLimit) => Math.min(prevLimit + 10, 50));
    } else {
      setHasMore(false);
    }
  };

  return (
    <div className="w-3/12 flex flex-col">
      <ScrollArea className="border-b-2 border p-2 h-full rounded-md overflow-y-auto h-[calc(100vh-16rem)]">
        {(!!runFilters.configId || !!runFilters.test) && (
          <div className="flex flex-row space-x-2 mb-2 items-center justify-between">
            {runFilters.configId && (
              <Badge
                className="p-1 px-4 cursor-pointer"
                onClick={() => {
                  setRunFilters({});
                  if (path) {
                    router.push(path);
                  }
                }}
              >
                Filtering by Prompt
                <XIcon className="ml-2 h-4 w-4" />
              </Badge>
            )}
            {runFilters.test && (
              <Badge
                className="p-1 px-4 cursor-pointer"
                onClick={() => {
                  setRunFilters({});
                  if (path) {
                    router.push(path);
                  }
                }}
              >
                Filtering By Test Runs
                <XIcon className="ml-2 h-4 w-4" />
              </Badge>
            )}
          </div>
        )}
        <div className="flex">
          <ToggleGroup
            type="single"
            value={runToggle}
            onValueChange={(value) => {
              if (value) setRunToggle(value);
              setShowNewRun(false);
            }}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="all" aria-label="Toggle all runs">
              <PlayIcon className="mr-2 h-4 w-4" />
              All Runs
            </ToggleGroupItem>
            <ToggleGroupItem value="mine" aria-label="Toggle my Runs">
              <UserIcon className="mr-2 h-4 w-4" />
              My Runs
            </ToggleGroupItem>
          </ToggleGroup>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewRun(true)}
            className="ml-2"
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>

        {showNewRn ? (
          <div className="mb-4 space-y-2 mt-2">
            <PromptTextarea clusterId={clusterId} />
          </div>
        ) : (
          <>
            <RunTab
              workflows={workflows}
              onGoToWorkflow={goToWorkflow}
              onRefetchWorkflows={fetchWorkflows}
              onGoToCluster={goToCluster}
              clusterId={clusterId}
            />
            {hasMore && (
              <Button
                onClick={loadMore}
                className="w-full mt-4"
                variant="outline"
              >
                Load More
              </Button>
            )}
            {!hasMore && limit >= 50 && (
              <p className="text-sm text-muted-foreground mt-4 text-center mb-2">
                Maximum number of runs loaded. Delete some runs to load older
                ones.
              </p>
            )}
          </>
        )}
      </ScrollArea>
    </div>
  );
}
