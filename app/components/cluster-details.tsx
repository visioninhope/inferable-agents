"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCallback, useEffect, useState } from "react";
import {
  SmallDeadRedCircle,
  SmallLiveAmberCircle,
  SmallLiveGreenCircle,
} from "./circles";
import { ClusterHealthPane } from "./cluster-health-plane";
import { ServiceDetailsPane } from "./service-details-pane"; // Add this import
import { Button } from "./ui/button";

import { client } from "@/client/client";
import { contract } from "@/client/contract";
import { useAuth } from "@clerk/nextjs";
import { ClientInferResponses } from "@ts-rest/core";
import {
  ServerConnectionPane,
  ServerConnectionStatus,
} from "./server-connection-pane";

export function ClusterDetails({
  clusterId,
}: {
  clusterId: string;
}): JSX.Element {
  const { getToken } = useAuth();

  const [clusterDetails, setClusterDetails] = useState<
    ClientInferResponses<typeof contract.getCluster, 200>["body"] | null
  >(null);

  const fetchClusterDetails = useCallback(async () => {
    if (!clusterId) {
      return;
    }

    const result = await client.getCluster({
      headers: {
        authorization: `Bearer ${await getToken()}`,
      },
      params: {
        clusterId,
      },
    });

    if (result.status === 200) {
      setClusterDetails(result.body);
    } else {
      ServerConnectionStatus.addEvent({
        type: "getCluster",
        success: false,
      });
    }
  }, [clusterId, getToken]);

  useEffect(() => {
    fetchClusterDetails();
    const interval = setInterval(fetchClusterDetails, 5000);
    return () => clearInterval(interval);
  }, [fetchClusterDetails]);

  const isLive = clusterDetails?.lastPingAt
    ? Date.now() - new Date(clusterDetails.lastPingAt).getTime() < 1000 * 60
    : false;

  const circle = !clusterDetails ? (
    <SmallLiveAmberCircle />
  ) : isLive ? (
    <SmallLiveGreenCircle />
  ) : (
    <SmallDeadRedCircle />
  );

  return (
    <div className="flex flex-col space-y-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between onboarding-health text-xs justify-between"
          >
            <span className="mr-2 flex">Machines</span> {circle}
          </Button>
        </SheetTrigger>
        <SheetContent
          style={{ minWidth: 800 }}
          className="overflow-scroll h-screen"
        >
          <SheetHeader>
            <SheetTitle>Cluster Health</SheetTitle>
          </SheetHeader>
          <div className="h-2" />
          <ClusterHealthPane clusterDetails={clusterDetails} />
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between onboarding-services text-xs"
          >
            <span className="mr-2 flex">Services</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          style={{ minWidth: "80%" }}
          className="overflow-scroll h-screen"
        >
          <SheetHeader>
            <SheetTitle>Service Details</SheetTitle>
          </SheetHeader>
          <div className="h-2" />
          <ServiceDetailsPane clusterDetails={clusterDetails} />
        </SheetContent>
      </Sheet>
      <ServerConnectionPane />
    </div>
  );
}
