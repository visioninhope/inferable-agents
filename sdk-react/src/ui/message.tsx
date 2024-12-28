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
  cellNumber?: number;
  isLastMessage?: boolean;
  className?: string;
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

export const MessageLine = ({
  id,
  content,
  type,
}: {
  id: string;
  content: string;
  type: string;
}) => {
  return (
    <pre className={cn("message-line", type)} id={id}>
      {content}
    </pre>
  );
};

export function Message({ message, cellNumber, isLastMessage = false, className }: MessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const parsedMessage = messageSchema.safeParse(message);

  if (!parsedMessage.success) {
    return <div className="message-error">Invalid message format</div>;
  }

  const data = parsedMessage.data;
  const isHuman = data.type === "human";
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
