import React, { useState } from "react";
import { useRun } from "../src";
import { useAgentUI } from "../src/hooks/useAgentUI";

export function TestPage() {
  const basicRun = useRun({
    clusterId: "01J7M4V93BBZP3YJYSKPDEGZ2T",
    baseUrl: "https://api.inferable.ai",
    authType: "custom",
    customAuthToken: "test",
  });

  const BasicAgent = useAgentUI({
    prompt: "Ping the server, and return the system status at the time of the ping.",
    run: basicRun,
  });

  const [mode, setMode] = useState<"minimal" | "fixed" | "floating">("floating");

  const [pingCount, setPingCount] = useState(1);

  const FormAgent = useAgentUI({
    prompt: `Ping the server ${pingCount} times, and return the system status at the time of the ping.`,
    run: basicRun,
  });

  const [message, setMessage] = useState("Hello, what are your tools?");

  const InitialMessageAgent = useAgentUI({
    prompt: message,
    run: basicRun,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <h1>Basic useAgentUI</h1>
      <div style={{ display: "flex", gap: "10px" }}>
        {["minimal", "fixed", "floating"].map(s => (
          <button key={s} onClick={() => setMode(s as "minimal" | "fixed" | "floating")}>
            {s}
          </button>
        ))}
      </div>
      <div>
        <BasicAgent.Trigger>Check system ({mode})</BasicAgent.Trigger>
        <BasicAgent.Pane mode={mode} />
      </div>

      <h1>useAgentUI with form</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "500px" }}>
        <label htmlFor="pingCount">How many times should I ping the server?</label>
        <input
          type="number"
          name="pingCount"
          value={pingCount}
          onChange={e => setPingCount(Number(e.target.value))}
        />
        <FormAgent.Trigger>Check system</FormAgent.Trigger>
        <FormAgent.Pane mode="fixed" />
      </div>

      <h1>useAgentUI with Initial Chat Message</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "500px" }}>
        <label htmlFor="message">What should I say?</label>
        <input
          type="text"
          name="message"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <InitialMessageAgent.Trigger>Check system</InitialMessageAgent.Trigger>
        <InitialMessageAgent.Pane mode="fixed" />
      </div>
    </div>
  );
}
