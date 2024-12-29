import React from "react";
import { useRun } from "../src";
import { useAgent } from "../src/hooks/useAgent";

export function TestPage(props: {}) {
  const run = useRun({
    clusterId: "01J7M4V93BBZP3YJYSKPDEGZ2T",
    baseUrl: "https://api.inferable.ai",
    authType: "custom",
    customAuthToken: "test",
  });

  const { Trigger, Pane } = useAgent({
    prompt: "Ping the server, and return the system status at the time of the ping.",
    run,
  });

  return (
    <div>
      <Trigger>Check system</Trigger>
      <Pane mode="minimal" />
    </div>
  );
}
