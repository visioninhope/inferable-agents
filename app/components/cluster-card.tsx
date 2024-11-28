"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2Icon } from "lucide-react";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { client } from "@/client/client";
import { cn, createErrorToast } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

interface Cluster {
  id: string;
  name: string;
  description: string | null;
}

interface ClusterCardProps {
  cluster: Cluster;
}

export function ClusterCard({ cluster }: ClusterCardProps) {
  const router = useRouter();
  const { getToken, orgId } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const handleClusterClick = useCallback(() => {
    if (!orgId) return;

    router.push(`/clusters/${cluster.id}`);
  }, [router, orgId, cluster]);

  const handleDeleteCluster = async () => {
    try {
      const result = await client.deleteCluster({
        headers: {
          authorization: `Bearer ${await getToken()}`,
        },
        params: {
          clusterId: cluster.id,
        },
      });

      if (result.status === 204) {
        toast.success("Cluster deleted successfully");
        setIsDeleteModalOpen(false);
        setDeleteConfirmation("");
        router.refresh();
      } else {
        createErrorToast(result, "Failed to delete cluster");
      }
    } catch (error) {
      createErrorToast(error, "Error deleting cluster");
    }
  };

  return (
    <>
      <Card className={cn("w-[400px] mr-4 mb-4 flex flex-col h-[220px]")}>
        <CardHeader>
          <CardTitle>{cluster.name}</CardTitle>
          <CardDescription className="text-xs">{cluster.id}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm flex-grow truncate">
          {cluster.description || " "}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleClusterClick}>View</Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <Trash2Icon className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              cluster &quot;{cluster.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <p className="text-sm text-gray-500 mb-2">
              Type &quot;delete {cluster.name}&quot; to confirm:
            </p>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="delete cluster"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCluster}
              disabled={deleteConfirmation.trim() !== `delete ${cluster.name}`}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
