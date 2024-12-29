import React, { useState } from "react";
import { useRun } from "../src";
import { useAgent } from "../src/hooks/useAgent";

export function TestPage() {
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

  const [mode, setMode] = useState<"minimal" | "fixed" | "floating">("floating");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", gap: "10px" }}>
        {["minimal", "fixed", "floating"].map(s => (
          <button key={s} onClick={() => setMode(s as "minimal" | "fixed" | "floating")}>
            {s}
          </button>
        ))}
      </div>
      <div>
        <Trigger>Check system ({mode})</Trigger>
        <Pane mode={mode} />
      </div>
    </div>
  );
}
