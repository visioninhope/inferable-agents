import React from "react";
import { useRun } from "../src";
import { useAgent } from "../src/hooks/useAgent";

export function TestPage(props: {}) {
  const runConfig = useRun({
    clusterId: "01J7M4V93BBZP3YJYSKPDEGZ2T",
    baseUrl: "https://api.inferable.ai",
    authType: "custom",
    customAuthToken: "test",
  });

  const { Trigger, Pane } = useAgent({
    initialMessage: "System Status",
    run: runConfig,
    userInputs: ["Times to ping"],
  });

  return (
    <div>
      <Trigger>Get the system status</Trigger>
      <Pane floating />
    </div>
  );
}
