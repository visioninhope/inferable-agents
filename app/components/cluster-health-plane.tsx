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
import { useAuth } from "@clerk/nextjs";
import { ClientInferResponseBody } from "@ts-rest/core";
import { formatRelative } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { DeadGrayCircle, DeadRedCircle, LiveGreenCircle } from "./circles";
import ErrorDisplay from "./error-display";
import { EventsOverlayButton } from "./events-overlay";
import { ClusterDetails } from "@/lib/types";

function MachinesOverview({ clusterId }: { clusterId: string }) {
  const [machines, setMachines] = useState<
    ClientInferResponseBody<typeof contract.listMachines, 200>
  >([]);
  const [liveMachineCount, setLiveMachineCount] = useState(0);
  const { getToken } = useAuth();
  const [error, setError] = useState<any>(null);

  const getClusterMachines = useCallback(async () => {
    const machinesResponse = await client.listMachines({
      headers: {
        authorization: `Bearer ${await getToken()}`,
      },
      params: {
        clusterId,
      },
    });

    if (machinesResponse.status === 200) {
      setMachines(machinesResponse.body);
      setLiveMachineCount(
        machinesResponse.body.filter(
          (m) => Date.now() - new Date(m.lastPingAt!).getTime() < 1000 * 60,
        ).length,
      );
    } else {
      setError(machinesResponse);
    }
  }, [clusterId, getToken]);

  useEffect(() => {
    getClusterMachines();

    const interval = setInterval(getClusterMachines, 1000 * 10);
    return () => clearInterval(interval);
  }, [getClusterMachines]);

  if (error) {
    return <ErrorDisplay status={error.status} error={error} />;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Machines</h2>
      <p className="text-muted-foreground mb-4">
        You have {liveMachineCount} machine
        {liveMachineCount === 1 ? "" : "s"} connected.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>IP</TableHead>
            <TableHead>Last Heartbeat</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="">
          {machines && machines.length > 0 ? (
            machines
              .sort(
                (a, b) =>
                  new Date(b.lastPingAt!).getTime() -
                  new Date(a.lastPingAt!).getTime(),
              )
              .map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    {Date.now() - new Date(m.lastPingAt!).getTime() <
                    1000 * 60 ? (
                      <LiveGreenCircle />
                    ) : (
                      <DeadGrayCircle />
                    )}
                  </TableCell>
                  <TableCell className="font-mono flex items-center gap-2">
                    {m.id}
                    <EventsOverlayButton
                      clusterId={clusterId}
                      query={{ machineId: m.id }}
                    />
                  </TableCell>
                  <TableCell>{m.ip}</TableCell>
                  <TableCell>
                    {formatRelative(m.lastPingAt!, new Date())}
                  </TableCell>
                </TableRow>
              ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                <DeadRedCircle />
                Your machines are offline.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function ClusterHealthPane({
  clusterDetails,
}: {
  clusterDetails: ClusterDetails | null;
}): JSX.Element {
  return (
    <div>
      <div className="h-8" />
      {clusterDetails?.id && <MachinesOverview clusterId={clusterDetails.id} />}
    </div>
  );
}
