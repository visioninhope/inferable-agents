import { z } from "zod";
import "./message.css";
import React, { useState } from "react";
import { cn } from "../lib/utils";

const messageSchema = z.object({
  id: z.string(),
  type: z.string(),
  createdAt: z.string(),
  metadata: z.unknown().nullable(),
  displayableContext: z.unknown().nullable(),
  data: z.object({
    message: z.string().optional(),
    invocations: z
      .array(
        z.object({
          toolName: z.string(),
          reasoning: z.string(),
          id: z.string(),
          input: z.record(z.unknown()).optional(),
        })
      )
      .optional(),
    result: z.record(z.unknown()).optional(),
  }),
});

type MessageProps = {
  message: unknown;
};

const msgs = (m: z.infer<typeof messageSchema>) => {
  if (m.data.message) {
    return [
      {
        id: m.id,
        content: m.data.message,
      },
    ];
  } else if (m.data.invocations) {
    return m.data.invocations.map(invocation => ({
      id: `${m.id}-${invocation.id}`,
      content: `${invocation.reasoning} (${invocation.toolName})`,
    }));
  }
};

const jsonToMarkdown = (json: string) => {
  const parsed = JSON.parse(json);
  return Object.entries(parsed)
    .map(([key, value]) => `${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`)
    .join("\n");
};

export const MessageLine = ({
  id,
  content,
  type,
}: {
  id: string;
  content: string;
  type: string;
}) => {
  const isJson = content.startsWith("{") && content.endsWith("}");

  if (isJson) {
    return (
      <>
        <pre className={cn("message-line", type)} id={id}>
          {JSON.parse(content).message}
        </pre>
        <pre className="message-line-data">
          {Object.entries(JSON.parse(content).data).map(([key, value]) => (
            <span className="message-line-data-item">
              <span className="message-line-data-key">{key}</span>
              <span className="message-line-data-value">
                {typeof value === "string" ? value : JSON.stringify(value)}
              </span>
            </span>
          ))}
        </pre>
      </>
    );
  }

  return (
    <pre className={cn("message-line", type)} id={id}>
      {content}
    </pre>
  );
};

export function Message({ message }: MessageProps) {
  const parsedMessage = messageSchema.safeParse(message);

  if (!parsedMessage.success) {
    return <div className="message-error">Invalid message format</div>;
  }

  const data = parsedMessage.data;
  const isInvocationResult = data.type === "invocation-result";
  const hasResult =
    isInvocationResult && data.data.result && Object.keys(data.data.result).length > 0;

  if (hasResult) {
    return null;
  }

  return msgs(data)?.map(({ id, content }) => (
    <MessageLine key={id} id={id} content={content} type={data.type} />
  ));
}
