"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Message, MessageLine, MinimalMessage } from "../ui/message";
import { useRun } from "./useRun";
import { z } from "zod";
import "./useAgent.css";

interface Message {
  role: string;
  content: string;
}

type UseAgentProps = {
  prompt: string;
  run: ReturnType<typeof useRun>;
};

type UseAgentReturn = {
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

export function useAgent({ prompt: initialMessage, run }: UseAgentProps): UseAgentReturn {
  const [isPaneOpen, setIsPaneOpen] = useState(false);
  const triggerRef = React.useRef<HTMLSpanElement>(null);
  const [panePosition, setPanePosition] = useState({ top: 0, left: 0 });
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    if (isPaneOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPanePosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [isPaneOpen]);

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
    );
  };

  const Pane: React.FC<{ mode?: "floating" | "fixed" | "minimal" }> = ({ mode = "floating" }) => {
    if (!isPaneOpen) return null;

    const paneStyle = {
      floating: {
        position: "absolute" as const,
        top: panePosition.top,
        left: panePosition.left,
        right: "auto",
        width: "500px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
      fixed: {
        position: "fixed" as const,
        width: "60%",
        right: "0",
        bottom: "0",
        top: "0",
        height: "100%",
        margin: "0",
      },
      minimal: {
        position: "absolute" as const,
        top: panePosition.top,
        left: panePosition.left,
        width: "100%",
        maxWidth: "500px",
        boxShadow: "none",
      },
    }[mode];

    const sortedMessages = run.messages.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const lastAgentMessage =
      mode === "minimal" ? sortedMessages.filter(m => m.type === "agent").pop() : null;

    return (
      <div className="agent-pane" style={paneStyle}>
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
    );
  };

  return {
    Trigger,
    Pane,
  };
}
