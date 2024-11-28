import { client } from "@/client/client";
import { genericMessageDataSchema } from "@/client/contract";
import { createErrorToast } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { formatRelative } from "date-fns";
import { PencilLineIcon, RefreshCcw } from "lucide-react";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { MessageContainerProps } from "./workflow-event";

export function HumanMessage({
  clusterId,
  isEditable,
  runId,
  data,
  id: messageId,
  onPreMutation,
  pending,
  createdAt,
}: MessageContainerProps) {
  data = genericMessageDataSchema.parse(data);

  const [editing, setEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(data.message);
  const { getToken } = useAuth();

  const sendMessage = useCallback(async () => {
    if (!editedValue) return;

    await client
      .updateMessage({
        body: {
          message: editedValue,
        },
        headers: {
          authorization: `Bearer ${await getToken()}`,
        },
        params: {
          clusterId,
          runId,
          messageId,
        },
      })
      .then((result) => {
        if (result.status === 200) {
          toast.success("Success!");
        } else {
          createErrorToast(result, "Failed to update message");
        }
      })
      .catch((error) => {
        createErrorToast(error, "Failed to update message");
      });
  }, [editedValue, clusterId, runId, messageId, getToken]);

  const updateMessage = useCallback(async () => {
    const id = toast.loading("Updating message...");

    await sendMessage();

    toast.dismiss(id);
  }, [sendMessage]);

  const retryMessage = useCallback(async () => {
    const id = toast.loading("Retrying message...");

    await sendMessage();

    toast.dismiss(id);
  }, [sendMessage]);

  const onSubmit = useCallback(async () => {
    if (editedValue === data.message) {
      setEditing(false);
      return;
    }

    updateMessage().then(() => {
      setEditing(false);
      setEditedValue(data.message);
    });
  }, [editedValue, data, updateMessage, setEditing]);

  if (editing) {
    return (
      <div className="p-6 bg-gray-600">
        <Textarea
          value={editedValue}
          onChange={(e) => setEditedValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
        />
        <div className="flex space-x-1 mt-6">
          <Button
            size="sm"
            variant="secondary"
            className="h-6 mt-2"
            onClick={onSubmit}
          >
            Done
          </Button>
          {/* Cancel */}
          <Button
            size="sm"
            variant="secondary"
            className="h-6 mt-2"
            onClick={() => {
              setEditing(false);
              setEditedValue(data.message);
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-6 bg-gray-900 text-gray-50 ${pending ? `animate-pulse` : ``}`}
    >
      <p className="flex items-center font-semibold text-md">
        <div className="flex flex-row space-x-2">
          <p>Human</p>
          <p className="text-muted-background font-normal">
            {formatRelative(createdAt, new Date())}
          </p>
        </div>
      </p>
      <p className="mt-2 mb-4 whitespace-pre-line">{data.message}</p>
      <div className="mt-2 flex space-x-1">
        {isEditable ? (
          <div className="flex flex-row space-x-1">
            <Button
              size="sm"
              variant="secondary"
              className="h-6 bg-slate-700 text-white border-slate-600 border shadow-sm hover:bg-slate-400 hover:text-black"
              onClick={() => setEditing(true)}
              onMouseEnter={() => onPreMutation(true)}
              onMouseLeave={() => onPreMutation(false)}
            >
              <PencilLineIcon className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-6 bg-slate-700 text-white border-slate-600 border shadow-sm hover:bg-slate-400 hover:text-black"
              onClick={retryMessage}
              onMouseEnter={() => onPreMutation(true)}
              onMouseLeave={() => onPreMutation(false)}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
