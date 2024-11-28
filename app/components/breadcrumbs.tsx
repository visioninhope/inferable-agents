import { client } from "@/client/client";
import { auth } from "@clerk/nextjs";
import {
  BookOpen,
  ExternalLink,
  Network,
  PlayCircle,
  Settings,
  Hammer,
  Plug,
  Bot,
  NetworkIcon,
  ChevronRight,
  BarChart2,
} from "lucide-react";
import Link from "next/link";
import ErrorDisplay from "./error-display";

interface ClusterBreadcrumbsProps {
  clusterId: string;
}

const linkStyles =
  "px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:transition-all after:bg-gray-300 after:duration-300 flex items-center";

export async function ClusterBreadcrumbs({
  clusterId,
}: ClusterBreadcrumbsProps) {
  const { getToken } = auth();

  const clusterDetails = await client.getCluster({
    headers: { authorization: `Bearer ${await getToken()}` },
    params: { clusterId },
  });

  if (clusterDetails.status !== 200) {
    return (
      <ErrorDisplay
        error={clusterDetails.body}
        status={clusterDetails.status}
      />
    );
  }

  return (
    <div className="pl-6 pt-2 flex gap-3 items-center">
      <div className="flex items-center">
        <Link
          href={`/clusters/${clusterId}`}
          className="py-1.5 text-sm font-semibold text-gray-500 rounded-md transition-all"
        >
          {clusterDetails.body.name}
        </Link>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </div>
      <Link href={`/clusters/${clusterId}/runs`} className={linkStyles}>
        <PlayCircle className="h-4 w-4 mr-2" /> Runs
      </Link>
      {clusterDetails.body.enableRunConfigs && (
        <Link href={`/clusters/${clusterId}/configs`} className={linkStyles}>
          <Hammer className="h-4 w-4 mr-2" /> Run Configs
        </Link>
      )}
      {clusterDetails.body.enableKnowledgebase && (
        <Link href={`/clusters/${clusterId}/knowledge`} className={linkStyles}>
          <BookOpen className="h-4 w-4 mr-2" /> Knowledge
        </Link>
      )}
      <Link href={`/clusters/${clusterId}/integrations`} className={linkStyles}>
        <NetworkIcon className="h-4 w-4 mr-2" /> Integrations
      </Link>
      <Link href={`/clusters/${clusterId}/usage`} className={linkStyles}>
        <BarChart2 className="h-4 w-4 mr-2" /> Usage
      </Link>
      <Link href={`/clusters/${clusterId}/settings`} className={linkStyles}>
        <Settings className="h-4 w-4 mr-2" /> Settings
      </Link>
    </div>
  );
}

export async function GlobalBreadcrumbs() {
  return (
    <div className="pl-6 pt-2 flex gap-3">
      <Link href={`/clusters`} className={linkStyles}>
        <Network className="h-4 w-4 mr-2" /> Clusters
      </Link>
      <Link
        href={`https://docs.inferable.ai`}
        target="_blank"
        className={linkStyles}
      >
        <ExternalLink className="h-4 w-4 mr-2" /> Docs
      </Link>
    </div>
  );
}
