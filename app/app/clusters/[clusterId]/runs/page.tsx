import { client } from "@/client/client";
import { PromptTextarea } from "@/components/chat/prompt-textarea";
import ErrorDisplay from "@/components/error-display";
import { ServicesQuickstart } from "@/components/services-quickstart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@clerk/nextjs";
import { MessageSquarePlus } from "lucide-react";

export default async function Page({
  params: { clusterId },
}: {
  params: { clusterId: string };
}) {
  const { getToken } = auth();
  const token = await getToken();

  const response = await client.getCluster({
    headers: {
      authorization: `Bearer ${token}`,
    },
    params: {
      clusterId: clusterId,
    },
  });

  // TODO: limit this to one event.
  const events = await client.listEvents({
    headers: {
      authorization: `Bearer ${token}`,
    },
    params: { clusterId },
  });

  if (response.status !== 200 || events.status !== 200) {
    return <ErrorDisplay error={response.body} status={response.status} />;
  }

  if (events.body?.length === 0) {
    return <ServicesQuickstart clusterId={clusterId} />;
  }

  return (
    <div className="flex flex-col overflow-auto px-2 space-y-4">
      <Card className="w-full onboarding-prompt">
        <CardHeader>
          <div className="flex items-center">
            <MessageSquarePlus className="mr-2 h-6 w-6" />
            <CardTitle>Start with a prompt</CardTitle>
          </div>
          <CardDescription>
            Start a new run by entering a prompt, or selecting from the
            available Run Configurations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PromptTextarea clusterId={clusterId} />
        </CardContent>
      </Card>
    </div>
  );
}
