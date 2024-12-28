import React, { useState } from "react";
import { useRun } from "../src";
import { useAgent } from "../src/hooks/useAgent";
import { z } from "zod";
import assert from "assert";

export function TestPage(props: {}) {
  const [message, setMessage] = useState("");
  const [started, setStarted] = useState(false);

  const runConfig = useRun({
    clusterId: "01J7M4V93BBZP3YJYSKPDEGZ2T",
    baseUrl: "https://api.inferable.ai",
    authType: "custom",
    customAuthToken: "test",
  });

  const { createMessage, messages, run } = runConfig;

  const { Trigger, Pane } = useAgent({
    initialMessage: "System Status",
    run: runConfig,
    onSubmit: async message => {
      await createMessage({
        message,
        type: "human",
      });
    },
    userInputSchema: ["Times to ping"],
  });

  const handleSubmit = async () => {
    await createMessage({
      message,
      type: "human",
    });
    setMessage("");
  };

  return (
    <div>
      <Trigger>Open Agent</Trigger>
      <Pane floating={true} />
    </div>
  );
}
