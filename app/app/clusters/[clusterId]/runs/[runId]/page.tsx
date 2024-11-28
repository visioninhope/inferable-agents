"use client";

import { EventsOverlayButton } from "@/components/events-overlay";
import { Run } from "@/components/workflow";

function Page({
  params: { clusterId, runId },
}: {
  params: {
    clusterId: string;
    runId: string;
  };
}) {
  return (
    <div>
      <div className="flex flex-row mb-2 space-x-2 items-center">
        <EventsOverlayButton
          clusterId={clusterId}
          query={{ workflowId: runId }}
          text="Events"
        />
      </div>
      <Run clusterId={clusterId} runId={runId} />
    </div>
  );
}

export default Page;
