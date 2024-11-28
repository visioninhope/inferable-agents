import { client } from "@/client/client";
import { contract } from "@/client/contract";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createErrorToast } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { ClientInferResponseBody } from "@ts-rest/core";
import { AppWindowIcon, Layers } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ToolContextButton from "./chat/ToolContextButton";

export type Service = {
  name: string;
  description?: string;
  functions?: {
    name: string;
    description?: string;
    schema?: string;
  }[];
};

function toServiceName(name: string) {
  return <span>{name}</span>;
}

function toFunctionName(name: string, serviceName: string) {
  if (serviceName === "InferableApplications") {
    return <span>Inferable App</span>;
  }

  return <span>{name}</span>;
}

export default function ServicesOverview({ clusterId }: { clusterId: string }) {
  const [services, setServices] = useState<
    ClientInferResponseBody<typeof contract.listServices, 200>
  >([]);
  const { getToken } = useAuth();

  const getClusterServices = useCallback(async () => {
    const servicesResponse = await client.listServices({
      headers: {
        authorization: `Bearer ${await getToken()}`,
      },
      params: {
        clusterId,
      },
    });

    if (servicesResponse.status === 200) {
      setServices(servicesResponse.body);
    } else {
      createErrorToast(servicesResponse, "Failed to get cluster services");
    }
  }, [clusterId, getToken]);

  useEffect(() => {
    getClusterServices();
  }, [getClusterServices]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Services</h2>
      <p className="text-muted-foreground mb-4">
        You have {services.length} services with{" "}
        {services.flatMap((s) => s.functions).length} functions.
      </p>
      {services
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((service) => (
          <div key={service.name} className="mb-8">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              {service.name === "InferableApplications" ? (
                <AppWindowIcon className="w-5 h-5 mr-2" />
              ) : (
                <Layers className="w-5 h-5 mr-2" />
              )}
              {toServiceName(service.name)}
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Function</TableHead>
                  <TableHead className="w-2/3">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {service.functions
                  ?.sort((a, b) => a.name.localeCompare(b.name))
                  .map((func) => (
                    <TableRow key={func.name}>
                      <TableCell className="w-1/3">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">
                            {toFunctionName(func.name, service.name)}
                          </span>
                          <ToolContextButton
                            clusterId={clusterId}
                            service={service.name}
                            functionName={func.name}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="w-2/3">
                        {func.description || "No description"}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        ))}
    </div>
  );
}
