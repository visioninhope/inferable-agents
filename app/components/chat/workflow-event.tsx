import { contract } from "@/client/contract";
import { ClientInferResponseBody } from "@ts-rest/core";
import React from "react";
import { AiMessage } from "./ai-message";
import { HumanMessage } from "./human-message";
import { TemplateMessage } from "./template-mesage";
import { WorkflowJob } from "@/lib/types";

export type MessageContainerProps = {
  id: string;
  createdAt: Date;
  data: ClientInferResponseBody<
    typeof contract.listMessages,
    200
  >[number]["data"];
  displayableContext?: Record<string, string>;
  isEditable: boolean;
  type: ClientInferResponseBody<
    typeof contract.listMessages,
    200
  >[number]["type"];
  showMeta: boolean;
  clusterId: string;
  jobs: WorkflowJob[];
  pending?: boolean;
  runId: string;
  onPreMutation: (isHovering: boolean) => void;
};

const container: {
  [key: string]: (props: MessageContainerProps) => React.ReactNode;
} = {
  human: HumanMessage,
  agent: AiMessage,
  template: TemplateMessage,
  default: ({ data }) => <p>{JSON.stringify(data)}</p>,
};

function RunEvent(
  props: Omit<MessageContainerProps, "onPreMutation"> & {
    onPreMutation: (ulid: string) => void;
  },
) {
  const Container = container[props.type] || container.default;

  return (
    <Container
      data={props.data}
      jobs={props.jobs}
      type={props.type}
      clusterId={props.clusterId}
      runId={props.runId}
      isEditable={props.isEditable}
      id={props.id}
      displayableContext={props.displayableContext}
      showMeta={props.showMeta}
      onPreMutation={(inside) =>
        inside
          ? props.onPreMutation(props.id)
          : props.onPreMutation("7ZZZZZZZZZZZZZZZZZZZZZZZZZ")
      }
      createdAt={props.createdAt}
      pending={props.pending ?? false}
    />
  );
}

export default RunEvent;
