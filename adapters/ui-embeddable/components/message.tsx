import { z } from "zod";
import "./message.css";
import { useState } from "react";

const messageSchema = z.object({
  id: z.string(),
  type: z.string(), // "human", "agent", or "invocation-result"
  createdAt: z.string(),
  metadata: z.unknown().nullable(),
  displayableContext: z.unknown().nullable(),
  data: z.object({
    message: z.string().optional(),
    invocations: z.array(z.object({
      toolName: z.string(),
      reasoning: z.string(),
      id: z.string(),
      input: z.record(z.unknown()).optional(),
    })).optional(),
    result: z.record(z.unknown()).optional(),
  }),
});

export function Message({ message }: { message: unknown }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const parsedMessage = messageSchema.safeParse(message);

  if (!parsedMessage.success) {
    return <div className="message-error">Invalid message format</div>;
  }

  const data = parsedMessage.data;
  const isHuman = data.type === "human";
  const isInvocationResult = data.type === "invocation-result";

  return (
    <div className="message-container">
      <div className={`message-bubble ${isHuman ? 'message-human' : isInvocationResult ? 'message-invocation' : 'message-agent'}`}>
        {isHuman && <span className="message-prefix">❯ </span>}
        {data.data.message && (
          <div className="message-content">
            {data.data.message}
          </div>
        )}

        {data.data.invocations?.map((invocation) => (
          <div key={invocation.id} className="message-invocation-item">
            <span className="invocation-tool">{invocation.toolName}:</span> {invocation.reasoning}
          </div>
        ))}

        {isInvocationResult && data.data.result && (
          <div className="message-result-container">
            <button
              className="message-result-toggle"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? '▼' : '▶'} Result
            </button>
            {isExpanded && (
              <div className="message-result">
                <pre>{JSON.stringify(data.data.result, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        <div className="message-timestamp">
          {new Date(data.createdAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
