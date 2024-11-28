import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Trash2 } from "lucide-react";
import { client } from "@/client/client";
import { auth } from "@clerk/nextjs";
import ErrorDisplay from "@/components/error-display";
import { revalidatePath } from "next/cache";

const config = {
  toolhouse: {
    name: "Toolhouse",
    description:
      "Connect your toolhouse.ai tools directly to your Inferable Runs",
    icon: "🛠️",
    slug: "toolhouse",
  },
  langfuse: {
    name: "Langfuse",
    description: "Send LLM telemetry to Langfuse for monitoring and analytics",
    icon: "📊",
    slug: "langfuse",
  },
};

export default async function IntegrationsPage({
  params: { clusterId },
}: {
  params: { clusterId: string };
}) {
  const { getToken } = auth();

  const response = await client.getIntegrations({
    headers: {
      authorization: `Bearer ${await getToken()}`,
    },
    params: {
      clusterId,
    },
  });

  if (response.status !== 200) {
    return <ErrorDisplay status={response.status} error={response.body} />;
  }

  async function handleUninstall(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;

    const { getToken } = auth();

    await client.upsertIntegrations({
      headers: {
        authorization: `Bearer ${await getToken()}`,
      },
      params: { clusterId },
      body: {
        [name]: null,
      },
    });

    revalidatePath(`/clusters/${clusterId}/integrations`);
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold mb-2">Integrations</h1>
        <p className="text-gray-500 mb-6">
          Connect your Inferable cluster with other tools and services
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(response.body).map(([key, integration]) => (
            <Card className="flex flex-col" key={key}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>{key}</CardTitle>
                </div>
                <CardDescription>
                  {config[key as keyof typeof config]?.description ?? "Unknown"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex items-end">
                <div className="w-full flex gap-2">
                  <Link
                    href={`/clusters/${clusterId}/integrations/${key}`}
                    className="flex-grow"
                  >
                    <Button className="w-full" variant="outline">
                      {integration !== null ? "Configure" : "Install"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  {integration !== null && (
                    <form action={handleUninstall}>
                      <input type="hidden" name="name" value={key} />
                      <Button
                        variant="destructive"
                        size="icon"
                        type="submit"
                        title="Uninstall integration"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="flex flex-col" key="zapier">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Zapier</CardTitle>
              </div>
              <CardDescription>
                Integrate your Inferable Runs with Zapier
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-end">
              <Link
                href={`https://docs.inferable.ai/pages/zapier`}
                className="flex-grow"
              >
                <Button className="w-full" variant="outline">
                  Learn more
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
