"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Message, MessageLine, MinimalMessage } from "../ui/message";
import { useRun } from "./useRun";
import { z } from "zod";
import "./useAgentUI.css";

interface Message {
  role: string;
  content: string;
}

type UseAgentUIProps = {
  prompt: string;
  run: ReturnType<typeof useRun>;
};

type UseAgentUIReturn = {
  Trigger: React.FC<{ children?: React.ReactNode }>;
  Pane: React.FC<{ mode?: "floating" | "fixed" | "minimal" }>;
};

const humanStatus = (run: ReturnType<typeof useRun>["run"]) => {
  if (!run) return "Processing request...";
  if (run.status === "done") return "Completed";
  if (run.status === "running") return "Running...";
  if (run.status === "paused") return "Paused";
  if (run.status === "pending") return "Pending...";
  if (run.status === "failed") return "An error occurred";
  return "";
};

export function useAgentUI({ prompt: initialMessage, run }: UseAgentUIProps): UseAgentUIReturn {
  const [isPaneOpen, setIsPaneOpen] = useState(false);
  const triggerRef = React.useRef<HTMLSpanElement>(null);
  const [isComposing, setIsComposing] = useState(false);

  const initRunWithMessage = useCallback(
    (message: string) => {
      run
        .init()
        .then(() =>
          run.createMessage({
            message,
            type: "human",
          })
        )
        .catch(error => {
          console.error(error);
        });
    },
    [run]
  );

  const Trigger: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    return (
      <span className="use-agent">
        <span
          ref={triggerRef}
          className="agent-trigger"
          onClick={() => {
            setIsPaneOpen(true);

            if (!run.run?.id) {
              initRunWithMessage(initialMessage);
            }
          }}
        >
          {children || "Open Agent"}
        </span>
      </span>
    );
  };

  const Pane: React.FC<{ mode?: "floating" | "fixed" | "minimal" }> = ({ mode = "floating" }) => {
    if (!isPaneOpen) return null;

    const sortedMessages = run.messages.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const lastAgentMessage =
      mode === "minimal" ? sortedMessages.filter(m => m.type === "agent").pop() : null;

    return (
      <span className="use-agent">
        <div className={`agent-pane ${mode}`}>
          <div className="agent-content">
            <div className="agent-messages-container">
              {mode === "minimal" ? (
                <MinimalMessage message={lastAgentMessage} />
              ) : (
                sortedMessages.map((message, index) =>
                  index === 0 ? (
                    <MessageLine
                      id={message.id}
                      content={`> ${humanStatus(run.run)}`}
                      type={"human"}
                    />
                  ) : (
                    <Message key={index} message={message} />
                  )
                )
              )}
            </div>
            <div className="agent-bottom-bar">
              <div className="agent-message-composer">
                {!isComposing ? (
                  <div className="agent-button-group">
                    <button
                      className="agent-compose-trigger"
                      onClick={() => setIsComposing(true)}
                      disabled={run.run?.status !== "done"}
                      style={{
                        opacity: run.run?.status !== "done" ? 0.5 : 1,
                        cursor: run.run?.status !== "done" ? "not-allowed" : "pointer",
                      }}
                    >
                      <span className="agent-button-icon">+</span>
                      <span>Continue</span>
                    </button>
                    <button
                      className="agent-compose-trigger"
                      onClick={() => {
                        setIsPaneOpen(false);
                      }}
                    >
                      <span className="agent-button-icon">×</span>
                      <span>Dismiss</span>
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const message = formData.get("message")?.toString();
                      if (message) {
                        initRunWithMessage(message);
                        (e.target as HTMLFormElement).reset();
                      }
                      setIsComposing(false);
                    }}
                  >
                    <div className="agent-compose-container">
                      <input
                        className="agent-message-input"
                        placeholder="Type your message..."
                        autoFocus
                        name="message"
                      />
                      <button className="agent-send-button" type="submit">
                        Send
                      </button>
                      <button className="agent-send-button" onClick={() => setIsComposing(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </span>
    );
  };

  return {
    Trigger,
    Pane,
  };
}
