"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Message } from "../ui/message";
import { useRun } from "./useRun";
import { z } from "zod";
import "./useAgent.css";

interface Message {
  role: string;
  content: string;
}

type UseAgentProps = {
  initialMessage: string;
  userInputs?: string[];
  run: ReturnType<typeof useRun>;
};

type UseAgentReturn = {
  Trigger: React.FC<{ children?: React.ReactNode }>;
  Pane: React.FC<{ floating?: boolean }>;
};

export function useAgent({
  initialMessage,
  userInputs: userInputSchema,
  run,
}: UseAgentProps): UseAgentReturn {
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

  const Trigger: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    return (
      <span
        ref={triggerRef}
        className="agent-trigger"
        onClick={() => {
          if (isPaneOpen) {
            setIsPaneOpen(false);
          } else {
            setIsPaneOpen(true);
          }
        }}
      >
        {children || "Open Agent"}
      </span>
    );
  };

  const Pane: React.FC<{ floating?: boolean }> = ({ floating }) => {
    const hasForm = userInputSchema && Object.keys(userInputSchema).length > 0;

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

    const handleFormSubmit = useCallback(
      (formData: Record<string, string>) => {
        const messageWithData = JSON.stringify({ message: initialMessage, data: formData });
        initRunWithMessage(messageWithData);
      },
      [initialMessage, initRunWithMessage]
    );

    useEffect(() => {
      if (!isPaneOpen || !run.run?.id || run.messages.length > 0) return;

      if (!hasForm) {
        initRunWithMessage(initialMessage);
      }
    }, [isPaneOpen, run.run?.id, run.messages.length, hasForm, initialMessage, initRunWithMessage]);

    if (!isPaneOpen) return null;

    const paneStyle = floating
      ? {
          position: "absolute" as const,
          top: panePosition.top,
          left: panePosition.left,
          right: "auto",
          width: "500px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }
      : undefined;

    return (
      <div className="agent-pane" style={paneStyle}>
        <div className="agent-content">
          {hasForm && run.messages.length === 0 && (
            <form
              onSubmit={e => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const formEntries = Object.fromEntries(
                  Array.from(formData.entries()).map(([key, value]) => [key, value.toString()])
                ) as Record<string, string>;
                handleFormSubmit(formEntries);
              }}
              className="agent-form"
            >
              {userInputSchema?.map(key => (
                <div key={key} className="agent-form-group">
                  <label htmlFor={key} className="agent-label">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <input id={key} name={key} className="agent-input" type="text" />
                </div>
              ))}
              <button type="submit" className="agent-button">
                Submit
              </button>
            </form>
          )}
          <div className="agent-messages-container">
            {run.messages
              .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
              .map((message, index) => (
                <Message
                  key={index}
                  message={message}
                  isLastMessage={index === run.messages.length - 1}
                />
              ))}
          </div>
          <div className="agent-bottom-bar">
            <p className="agent-status">
              {run.run?.status === "done"
                ? "Completed"
                : run.run?.status === "running"
                  ? "Running..."
                  : run.run?.status === "paused"
                    ? "Paused"
                    : run.run?.status === "pending"
                      ? "Pending..."
                      : run.run?.status === "failed"
                        ? "An error occurred"
                        : ""}
            </p>
            {run.run?.status === "done" && (
              <div className="agent-message-composer">
                {!isComposing ? (
                  <div className="agent-button-group">
                    <button className="agent-compose-trigger" onClick={() => setIsComposing(true)}>
                      <span className="agent-button-icon">+</span>
                      <span>Continue</span>
                    </button>
                    <button
                      className="agent-compose-trigger"
                      onClick={() => {
                        run.destroy();
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
                    </div>
                  </form>
                )}
              </div>
            )}
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
