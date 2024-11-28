import { client } from "@/client/client";
import { useDebounce } from "@uidotdev/usehooks";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react"; // Change to ChevronRight
import { contract } from "@/client/contract";
import { ClientInferResponseBody } from "@ts-rest/core";

export function TemplateSearch({
  prompt,
  onSelect,
  clusterId,
}: {
  prompt: string;
  onSelect: (
    template: ClientInferResponseBody<
      typeof contract.searchRunConfigs,
      200
    >[number],
  ) => void;
  clusterId: string;
}) {
  const [results, setResults] = useState<
    ClientInferResponseBody<typeof contract.searchRunConfigs, 200>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const { getToken } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  const debouncedPrompt = useDebounce(prompt, 500);

  const searchPromptTemplates = useCallback(
    async (searchPrompt: string) => {
      try {
        const response = await client.searchRunConfigs({
          params: {
            clusterId: clusterId,
          },
          query: {
            search: searchPrompt,
          },
          headers: {
            authorization: `Bearer ${await getToken()}`,
          },
        });

        if (response.status === 200) {
          return response.body;
        } else {
          console.error(`Failed to search run configs: ${response.status}`);
          return [];
        }
      } catch (error) {
        console.error("An error occurred while searching run configs:", error);
        return [];
      }
    },
    [clusterId, getToken],
  );

  useEffect(() => {
    const fetchResults = async () => {
      setIsSearching(true);
      const data = await searchPromptTemplates(debouncedPrompt);
      setResults(data);
      setIsSearching(false);
    };

    fetchResults();
  }, [debouncedPrompt, searchPromptTemplates]);

  return (
    <Collapsible className="py-2" open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center cursor-pointer">
          <ChevronRight
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 mr-1 ${
              isOpen ? "transform rotate-90" : ""
            }`}
          />
          <span className="text-muted-foreground text-xs">
            {isSearching
              ? "Searching for run configs..."
              : debouncedPrompt.length > 0
                ? `${results.length} related prompt${results.length !== 1 ? "s" : ""} found`
                : "Available Run Configs"}
          </span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 text-muted-foreground text-xs">
        {results.map((template, index) => (
          <button
            key={index}
            onClick={() => onSelect(template)}
            className={`inline-block px-3 py-1 mr-2 mb-2 font-medium text-gray-700  border border-gray-200 rounded-md hover:bg-gray-50 transition-colors hover:opacity-100`}
            style={{
              opacity: Math.min(template.similarity + 0.5, 1),
            }}
          >
            {template.name}
          </button>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
