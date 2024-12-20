import { agentDataSchema } from "@/client/contract";
import { formatRelative } from "date-fns";
import { startCase } from "lodash";
import {
  AlertTriangle,
  Brain,
  CheckCircleIcon,
  MessageCircle,
  MessageCircleReply,
  Speaker,
  Speech,
} from "lucide-react";
import { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { z } from "zod";
import { JSONDisplay } from "../JSONDisplay";
import { MessageContainerProps } from "./workflow-event";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface DataSectionProps {
  title: string;
  icon: React.ComponentType<any>;
  content: ReactNode;
}

const DataSection = ({ title, icon: Icon, content }: DataSectionProps) => (
  <div className="mb-4 last:mb-0">
    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-2">
      <Icon size={16} className="text-primary/70" />
      <span className="text-sm">{title}</span>
    </div>
    <div className="ml-6">{content}</div>
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
            <div className="text-sm font-medium text-muted-foreground/80 mb-2">
              {startCase(key)}
            </div>
            <div className="bg-muted rounded-md p-3 shadow-sm">
              {value.split("\n").map((v, index) => (
                <p key={index} className="text-sm leading-relaxed">
                  {v}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <JSONDisplay json={result} />;
};

export const AiMessage = ({ data, createdAt }: MessageContainerProps) => {
  const parsedData = agentDataSchema.parse(data);
  const { issue, result, message, invocations, learnings } = parsedData;

  const hasReasoning = invocations?.find((invocation) => invocation.reasoning);
  if (!hasReasoning && !message && !result && !issue && !learnings) {
    return null;
  }

  return (
    <div className="mx-4">
      <div className="rounded-xl bg-white p-4 shadow-sm border border-border/50 hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/50">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Brain size={18} className="text-primary" />
          </div>
          <div>
            <div className="text-sm font-medium">Inferable</div>
            <div className="text-xs text-muted-foreground">
              {formatRelative(createdAt, new Date())}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {message && (
            <div className="bg-secondary/10 rounded-lg p-4">
              <ReactMarkdown className="text-sm text-foreground prose-sm prose-p:leading-relaxed prose-p:my-1.5 prose-pre:bg-muted prose-pre:p-3 prose-pre:rounded-md">
                {message}
              </ReactMarkdown>
            </div>
          )}

          {result && (
            <div className="bg-secondary/5 rounded-lg p-4 border border-border/50">
              <div className="text-sm font-medium mb-2 text-muted-foreground">
                Results
              </div>
              <ResultSection result={result} />
            </div>
          )}

          {(hasReasoning || learnings) && (
            <div className="border-t border-border/50 pt-4 ">
              <Collapsible>
                <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <Brain className="h-4 w-4" />
                  Agent Reasoning
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 space-y-4">
                  {hasReasoning &&
                    invocations?.map((invocation, index) => (
                      <div
                        key={index}
                        className="bg-muted/30 rounded-md p-3 text-xs text-muted-foreground"
                      >
                        <span className="font-medium">
                          Invoking {invocation.toolName}:
                        </span>{" "}
                        {invocation.reasoning}
                      </div>
                    ))}

                  {learnings?.map((learning, index) => (
                    <div
                      key={index}
                      className="bg-muted/30 rounded-md p-3 text-xs"
                    >
                      <div className="text-muted-foreground">
                        {learning.summary}
                      </div>
                      <div className="text-[10px] text-muted-foreground/70 mt-1">
                        Entities:{" "}
                        {learning.entities.map((e: any) => e.name).join(", ")}
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {issue && (
            <div className="bg-red-50 text-red-900/80 rounded-lg p-4 text-sm border border-red-100">
              <AlertTriangle className="h-4 w-4 inline-block mr-2 text-red-500" />
              {issue}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
