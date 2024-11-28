import { agentDataSchema } from "@/client/contract";
import { formatRelative } from "date-fns";
import { startCase } from "lodash";
import { AlertTriangle, Brain, CheckCircleIcon } from "lucide-react";
import { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { z } from "zod";
import { JsonForm } from "../json-form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { MessageContainerProps } from "./workflow-event";

interface DataSectionProps {
  title: string;
  icon: React.ComponentType<any>;
  content: ReactNode;
}

const DataSection = ({ title, icon: Icon, content }: DataSectionProps) => (
  <div>
    <div className="flex items-center space-x-2 text-muted-foreground mb-1">
      <Icon size={16} />
      <span>{title}</span>
    </div>
    {content}
  </div>
);

const basicResultSchema = z.record(z.string());

const ResultSection = ({ result }: { result: object }) => {
  const { success: basic, data: basicData } =
    basicResultSchema.safeParse(result);

  if (basic) {
    return (
      <div className="space-y-4">
        {Object.entries(basicData).map(([key, value]) => (
          <div key={key}>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">
              {startCase(key)}
            </h4>
            <div className="bg-muted rounded-md p-3">
              {value.split("\n").map((v, index) => (
                <p key={index} className="text-sm leading-relaxed py-1">
                  {v}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <JsonForm label="" value={result} />;
};

export const AiMessage = ({ data, createdAt }: MessageContainerProps) => {
  const parsedData = agentDataSchema.parse(data);
  const { issue, result, message, invocations, learnings } = parsedData;

  const hasReasoning = invocations?.find((invocation) => invocation.reasoning);
  if (!hasReasoning && !message && !result && !issue && !learnings) {
    return null;
  }

  return (
    <Card className="ml-4 mb-4 mr-4">
      <CardHeader>
        <CardTitle className="flex items-center font-semibold text-md">
          <div className="flex flex-row space-x-2">
            <p>Inferable AI</p>
            <p className="text-muted-foreground font-normal">
              {formatRelative(createdAt, new Date())}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        {message && (
          <DataSection
            title="Message"
            icon={CheckCircleIcon}
            content={
              <ReactMarkdown className="text-sm text-muted-foreground my-2">
                {message}
              </ReactMarkdown>
            }
          />
        )}
        {result && <ResultSection result={result} />}
        {issue && (
          <DataSection
            title="Issue"
            icon={AlertTriangle}
            content={<p className="text-xs">{issue}</p>}
          />
        )}
        {hasReasoning &&
          invocations?.map((invocation, index) => (
            <DataSection
              key={index}
              title="Reasoning"
              icon={Brain}
              content={
                <p className="text-xs text">
                  Invoking {invocation.toolName}: {invocation.reasoning}
                </p>
              }
            />
          ))}
        {learnings?.map((learning, index) => (
          <DataSection
            key={index}
            title="Learning"
            icon={Brain}
            content={
              <p className="text-xs">
                {`${learning.summary} (${learning.entities.map((e: any) => e.name).join(", ")})`}
              </p>
            }
          />
        ))}
      </CardContent>
    </Card>
  );
};
