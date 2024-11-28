import { SettingsIcon } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Textarea } from "../ui/textarea";
import { ToolInput } from "./tool-input";
import { Checkbox } from "../ui/checkbox";

type RunConfigProps = {
  config: {
    attachedFunctions: string[];
    structuredOutput: string | null;
    reasoningTraces: boolean;
  };
  onConfigChange: (newConfig: {
    attachedFunctions: string[];
    structuredOutput: string | null;
    reasoningTraces: boolean;
  }) => void;
};

const RunConfig: React.FC<RunConfigProps> = ({ config, onConfigChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [attachedFunctions, setAttachedFunctions] = useState<string[]>(
    config.attachedFunctions.filter(Boolean),
  );

  const [structuredOutput, setStructuredOutput] = useState<string | null>(
    config.structuredOutput,
  );

  const [reasoningTraces, setReasoningTraces] = useState(
    config.reasoningTraces,
  );

  const hasConfig = attachedFunctions.length > 0 || !!structuredOutput;

  const handleApplyConfig = () => {
    if (structuredOutput) {
      try {
        JSON.parse(structuredOutput);
        setJsonInvalid(false);
      } catch (e) {
        toast.error("Invalid JSON in structured output");
        return;
      }
    }

    onConfigChange({
      attachedFunctions,
      structuredOutput,
      reasoningTraces,
    });
    setIsOpen(false);
  };

  const [jsonInvalid, setJsonInvalid] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className="relative">
          <SettingsIcon className="w-4 h-4 mr-2" />
          Run Config
          {hasConfig && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px]">
        <div className="space-y-4">
          <h3 className="font-semibold">Run Configuration</h3>
          <div className="space-x-2 flex flex-row items-center">
            <Checkbox
              checked={reasoningTraces}
              onCheckedChange={(checked) => setReasoningTraces(!!checked)}
            ></Checkbox>
            <Label>Enable Reasoning Traces</Label>
          </div>
          <div className="space-y-2">
            <Label>Attached Functions</Label>
            <p className="text-xs text-gray-500">
              Select the functions that the run will be able to use. If none
              selected, all functions will be available.
            </p>
            <ToolInput
              value={attachedFunctions}
              onChange={setAttachedFunctions}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="input-structured-output">
              Structured Output (JSON Schema)
            </Label>
            <p className="text-xs text-gray-500">
              A{" "}
              <a href="https://json-schema.org/" className="underline">
                JSON Schema
              </a>{" "}
              that describes the structured output the run must return.
            </p>
            <Textarea
              id="input-structured-output"
              value={structuredOutput ?? ""}
              onChange={(e) => setStructuredOutput(e.target.value || null)}
              onBlur={() => {
                if (structuredOutput) {
                  try {
                    JSON.parse(structuredOutput);
                    setJsonInvalid(false);
                  } catch (e) {
                    setJsonInvalid(true);
                  }
                } else {
                  setJsonInvalid(false);
                }
              }}
            />
            {jsonInvalid && (
              <p className="text-xs text-red-500">Invalid JSON</p>
            )}
          </div>
          <Button onClick={handleApplyConfig}>Apply Configuration</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default RunConfig;
