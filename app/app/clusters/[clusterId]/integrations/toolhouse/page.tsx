"use client";

import { client } from "@/client/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createErrorToast } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Loading } from "@/components/loading";

const formSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
});

export default function ToolhouseIntegration({
  params: { clusterId },
}: {
  params: { clusterId: string };
}) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const response = await client.upsertIntegrations({
      headers: {
        authorization: `Bearer ${await getToken()}`,
      },
      params: {
        clusterId: clusterId,
      },
      body: {
        toolhouse: {
          apiKey: data.apiKey,
        },
      },
    });

    if (response.status === 200) {
      toast.success("Integration updated");
      await fetchConfig();
      return;
    } else {
      console.error(response);
      createErrorToast(response, "Failed to update integration");
    }
  };

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    const response = await client.getIntegrations({
      headers: {
        authorization: `Bearer ${await getToken()}`,
      },
      params: {
        clusterId: clusterId,
      },
    });
    setLoading(false);

    if (response.status === 200) {
      const result = z
        .object({
          apiKey: z.string(),
        })
        .safeParse(response.body?.toolhouse);

      if (result.success) {
        form.setValue("apiKey", result.data.apiKey);
      }
    }
  }, [clusterId, getToken, form]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <Link
          href={`/clusters/${clusterId}/integrations`}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to integrations
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🛠️</span>
            <CardTitle>Configure Toolhouse</CardTitle>
          </div>
          <CardDescription>
            Connect your Toolhouse account to use your installed tools in this
            cluster. For more information, see{" "}
            <a
              href="https://docs.inferable.ai/pages/toolhouse"
              target="_blank"
              className="underline"
            >
              our docs
            </a>
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>Your Toolhouse API key</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Save Configuration</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
