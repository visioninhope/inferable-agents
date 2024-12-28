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

interface FormData {
  message?: string;
  isComposing?: boolean;
  [key: string]: string | boolean | undefined;
}

type UseAgentProps = {
  initialMessage: string;
  userInputSchema?: string[];
  run: ReturnType<typeof useRun>;
  onSubmit: (message: string) => void;
};

type UseAgentReturn = {
  Trigger: React.FC<{ children?: React.ReactNode }>;
  Pane: React.FC<{ floating?: boolean }>;
};

export function useAgent({ initialMessage, userInputSchema, run }: UseAgentProps): UseAgentReturn {
  const [isPaneOpen, setIsPaneOpen] = useState(false);
  const triggerRef = React.useRef<HTMLSpanElement>(null);
  const [panePosition, setPanePosition] = useState({ top: 0, left: 0 });

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
    const [formData, setFormData] = useState<FormData>({});

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
          .then(() => {
            setFormData({});
          })
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
        setFormData({});
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
                const rawFormData = Object.fromEntries(new FormData(e.target as HTMLFormElement));
                const stringFormData = Object.fromEntries(
                  Object.entries(rawFormData).map(([key, value]) => [key, value.toString()])
                );
                handleFormSubmit(stringFormData);
              }}
              className="agent-form"
            >
              {userInputSchema?.map(key => (
                <div key={key} className="agent-form-group">
                  <label htmlFor={key} className="agent-label">
                    {key}
                  </label>
                  <input
                    id={key}
                    name={key}
                    value={formData[key]?.toString() || ""}
                    onChange={e => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                    className="agent-input"
                  />
                </div>
              ))}
              <button type="submit" className="agent-button">
                Submit
              </button>
            </form>
          )}
          {run.messages
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map((message, index) => (
              <Message
                key={index}
                message={message}
                isLastMessage={index === run.messages.length - 1}
              />
            ))}
          {run.run?.status === "done" && (
            <div className="agent-message-composer">
              {!formData.isComposing ? (
                <div className="agent-button-group">
                  <button
                    className="agent-compose-trigger"
                    onClick={() =>
                      setFormData((prev: FormData) => ({ ...prev, isComposing: true }))
                    }
                  >
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
                <div className="agent-compose-container">
                  <input
                    className="agent-message-input"
                    placeholder="Type your message..."
                    value={formData.message || ""}
                    onChange={e =>
                      setFormData((prev: FormData) => ({ ...prev, message: e.target.value }))
                    }
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (formData.message?.trim()) {
                          run.createMessage({
                            message: formData.message.trim(),
                            type: "human",
                          });
                          setFormData((prev: FormData) => ({
                            ...prev,
                            message: "",
                            isComposing: false,
                          }));
                        }
                      } else if (e.key === "Escape") {
                        setFormData((prev: FormData) => ({
                          ...prev,
                          message: "",
                          isComposing: false,
                        }));
                      }
                    }}
                    autoFocus
                  />
                  <button
                    className="agent-send-button"
                    onClick={() => {
                      if (formData.message?.trim()) {
                        run.createMessage({
                          message: formData.message.trim(),
                          type: "human",
                        });
                        setFormData((prev: FormData) => ({
                          ...prev,
                          message: "",
                          isComposing: false,
                        }));
                      }
                    }}
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return {
    Trigger,
    Pane,
  };
}
