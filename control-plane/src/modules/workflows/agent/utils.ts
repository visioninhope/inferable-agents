import { getEncoding } from "js-tiktoken";
import {
  AIMessage,
  AIMessageChunk,
  BaseMessage,
  ToolMessage,
} from "@langchain/core/messages";

//https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb
// gpt-4, gpt-3.5-turbo, text-embedding-ada-002, text-embedding-3-small, text-embedding-3-large
export const estimateTokenCount = async (input?: string) =>
  getEncoding("cl100k_base").encode(input ?? "").length;

export const isFunctionResult = (message?: BaseMessage) => {
  return message instanceof ToolMessage;
};

export const isFunctionCall = (message?: BaseMessage) => {
  try {
    assertAIMessageLike(message);
  } catch {
    return false;
  }

  return message.tool_calls && message.tool_calls.length > 0;
};

export const isAIMessageLike = (message?: BaseMessage) => {
  return message instanceof AIMessage || message instanceof AIMessageChunk;
};

export function assertAIMessageLike(
  message?: BaseMessage,
): asserts message is AIMessage | AIMessageChunk {
  if (!message) throw new Error("No message provided to assertion");

  if (!isAIMessageLike(message))
    throw new Error("Expected instance of AIMessage or AIMessageChunk");
}
