import React, { useState, useEffect, useCallback } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { X, Check } from "lucide-react";
import { Button } from "../ui/button";
import { client } from "../../client/client";
import { createErrorToast } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";

interface ToolInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const standardLibrary = [
  {
    name: "inferable_inputRequest",
    description: "Allow the agent to pause the run to request input",
  },
  {
    name: "inferable_accessKnowledgeArtifacts",
    description: "Allow the agent to search for knowledge artifacts",
  },
];

export const ToolInput: React.FC<ToolInputProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [availableFunctions, setAvailableFunctions] = useState<
    Array<{ name: string; description?: string }>
  >([]);
  const { getToken } = useAuth();
  const params = useParams<{ clusterId: string }>();

  const fetchAvailableFunctions = useCallback(async () => {
    if (!params?.clusterId) {
      return;
    }

    const token = await getToken();
    const response = await client.listServices({
      headers: {
        authorization: `Bearer ${token}`,
      },
      params: {
        clusterId: params.clusterId,
      },
    });

    if (response.status === 200) {
      const functions = response.body.flatMap(
        (service) =>
          service.functions?.map((func) => ({
            name: `${service.name}_${func.name}`,
            description: func.description,
          })) || [],
      );
      setAvailableFunctions([...functions, ...standardLibrary]);
    } else {
      createErrorToast(response, "Failed to fetch available functions");
    }
  }, [params?.clusterId, getToken]);

  useEffect(() => {
    fetchAvailableFunctions();
  }, [fetchAvailableFunctions]);

  const handleSelect = (selectedTool: string) => {
    if (!value.includes(selectedTool)) {
      onChange([...value, selectedTool]);
    } else {
      onChange(value.filter((tool) => tool !== selectedTool));
    }
  };

  const handleRemove = (toolToRemove: string) => {
    onChange(value.filter((tool) => tool !== toolToRemove));
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "t" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="space-y-2">
      <Button onClick={() => setOpen(true)} size="sm" variant="outline">
        Select Tools
      </Button>
      <div className="flex flex-wrap gap-2">
        {value.map((tool) => (
          <span
            key={tool}
            className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center"
          >
            {tool}
            <button onClick={() => handleRemove(tool)} className="ml-1">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search tools..." />
        <CommandList>
          <CommandEmpty>No tools found.</CommandEmpty>
          {availableFunctions.length > 0 && (
            <CommandGroup heading="Available Tools">
              {availableFunctions.map((func) => (
                <CommandItem
                  key={func.name}
                  onSelect={() => handleSelect(func.name)}
                  className="cursor-pointer text-sm flex items-center justify-between p-2"
                >
                  <div className="flex flex-col items-start">
                    <p className="font-medium">{func.name}</p>
                    {func.description && (
                      <p className="text-muted-foreground text-xs">
                        {func.description}
                      </p>
                    )}
                  </div>
                  <div className="w-4 h-4 flex items-center justify-center">
                    {value.includes(func.name) && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  );
};
