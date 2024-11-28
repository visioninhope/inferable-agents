import { client } from "@/client/client";
import { contract } from "@/client/contract";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@clerk/nextjs";
import { ClientInferResponseBody } from "@ts-rest/core";
import { startCase } from "lodash";
import { Info } from "lucide-react";
import { useState } from "react";
import { ReadOnlyJSON } from "./read-only-json";

const sanitizedKey: { [key: string]: string } = {
  targetFn: "function",
};

export function DebugEvent({
  event,
  clusterId,
}: {
  event: ClientInferResponseBody<
    typeof contract.getRunTimeline,
    200
  >["activity"][number];
  clusterId: string;
}) {
  const [eventMeta, setEventMeta] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { getToken } = useAuth();

  const fetchEventMeta = async () => {
    if (eventMeta) return; // Don't fetch if we already have the data
    setIsLoading(true);
    try {
      const response = await client.getEventMeta({
        params: { clusterId, eventId: event.id },
        headers: {
          authorization: `Bearer ${await getToken()}`,
        },
      });
      if (response.status === 200) {
        setEventMeta(response.body.meta);
      } else {
        console.error("Failed to fetch event metadata");
      }
    } catch (error) {
      console.error("Error fetching event metadata:", error);
    } finally {
      setIsLoading(false);
      ``;
    }
  };

  return (
    <div className="ml-8 py-2">
      <div className="flex items-center space-x-2 mb-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <p className="text-sm font-medium text-gray-700">
          {startCase(event.type)}
        </p>
        <Sheet>
          <SheetTrigger asChild>
            <Info
              className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
              onClick={fetchEventMeta}
            />
          </SheetTrigger>
          <SheetContent
            style={{ minWidth: "60vw" }}
            className="overflow-scroll"
          >
            <SheetHeader>
              <SheetTitle>Event Metadata</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              {isLoading ? (
                <p>Loading metadata...</p>
              ) : eventMeta ? (
                <ReadOnlyJSON key={event.id} json={eventMeta} />
              ) : (
                <p>No metadata available</p>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex flex-wrap gap-2 ml-4">
        {Object.entries(event)
          .filter(
            ([key, value]) =>
              key !== "id" && key !== "createdAt" && key !== "type" && !!value,
          )
          .map(([key, value]) => (
            <span
              key={key}
              className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600 flex items-center"
            >
              <span className="font-medium mr-1">
                {sanitizedKey[key] ?? startCase(key)}:
              </span>
              <span>
                {value instanceof Date ? value.toISOString() : String(value)}
              </span>
            </span>
          ))}
      </div>
    </div>
  );
}
