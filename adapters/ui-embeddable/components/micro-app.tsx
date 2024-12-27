"use client";

import { useRun } from "@inferable/react";
import { useState, useEffect } from "react";
import "./micro-app.css";
import { Message } from "./message";

const clusterId = process.env.NEXT_PUBLIC_TEST_INFERABLE_CLUSTER_ID;

if (!clusterId) {
  throw new Error("NEXT_PUBLIC_TEST_INFERABLE_CLUSTER_ID is not set");
}

export type AppProps = {
  buttonText?: string;
  initialMessage: string;
}

export default function App({ buttonText, initialMessage }: AppProps) {
  const [isPaneOpen, setIsPaneOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const { createMessage, messages, run } = useRun({
    clusterId: clusterId!,
    customAuthToken: "test",
    onError: error => {
      console.error(error);
    },
    authType: "custom",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsThinking(true);
    createMessage({ type: "human", message: input });
    setInput("");
  };

  const handlePaneOpen = () => {
    setIsPaneOpen(!isPaneOpen);
    if (!isPaneOpen) {
      // Start a new chat session when pane is opened
      setIsThinking(true);
      createMessage({
        message: initialMessage,
        type: "human",
      });
    }
  };

  // Reset thinking state when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setIsThinking(false);
    }
  }, [messages]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    const messagesContainer = document.querySelector('.messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  if (!initialMessage) {
    return <p>No initial message provided</p>;
  }

  return (
    <div className="h-full micro-app relative">
      <button className={`button ${isPaneOpen ? "open" : ""}`} onClick={handlePaneOpen}>
        {buttonText || initialMessage}
      </button>

      {isPaneOpen && (
        <div className="pane">
          <div className="messages">
            {messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((msg, i) => (
              <Message key={i} message={msg} />
            ))}
            {isThinking && messages.length === 0 && (
              <div className="message-container">
                <div className="message-bubble message-agent">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {!showForm ? (
            <div className="message-container">
              <div className="message-bubble message-agent">
                <button
                  onClick={() => setShowForm(true)}
                  className="message-result-toggle"
                  disabled={isThinking || run?.status !== "done"}
                  style={{
                    color: isThinking || run?.status !== "done" ? "#aaa" : "#000",
                  }}
                >
                  Continue conversation
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="input-form">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your follow-up message..."
                className="text-input"
              />
              <button type="submit" className="send-button">
                Send
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
