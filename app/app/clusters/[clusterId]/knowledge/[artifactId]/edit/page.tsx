"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { client } from "@/client/client";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import {
  KnowledgeArtifactForm,
  KnowledgeArtifact,
} from "@/components/KnowledgeArtifactForm";
import { createErrorToast } from "@/lib/utils";

export default function EditKnowledgeArtifact() {
  const { getToken } = useAuth();
  const params = useParams();
  const router = useRouter();
  const clusterId = params?.clusterId as string;
  const artifactId = params?.artifactId as string;
  const [artifact, setArtifact] = useState<KnowledgeArtifact | null>(null);

  useEffect(() => {
    const fetchArtifact = async () => {
      try {
        const token = await getToken();
        const response = await client.getKnowledgeArtifact({
          params: { clusterId, artifactId },
          headers: { authorization: token as string },
        });

        if (response.status === 200) {
          setArtifact(response.body);
        } else {
          createErrorToast(response, "Artifact not found");
          router.push(`/clusters/${clusterId}/knowledge`);
        }
      } catch (error) {
        console.error("Error fetching artifact:", error);
        toast.error("Failed to fetch knowledge artifact");
      }
    };

    fetchArtifact();
  }, [getToken, clusterId, artifactId, router]);

  const handleUpdate = async (updatedArtifact: KnowledgeArtifact) => {
    try {
      const token = await getToken();

      const response = await client.upsertKnowledgeArtifact({
        params: { clusterId, artifactId },
        headers: { authorization: token as string },
        body: updatedArtifact,
      });

      if (response.status === 200) {
        toast.success("Knowledge artifact updated successfully");
      } else {
        createErrorToast(response, "Failed to update knowledge artifact");
      }
    } catch (error) {
      console.error("Error updating artifact:", error);
      toast.error("Failed to update knowledge artifact");
    }
  };

  if (!artifact) {
    return null;
  }

  return (
    <KnowledgeArtifactForm
      initialArtifact={artifact}
      onSubmit={handleUpdate}
      onCancel={() => router.push(`/clusters/${clusterId}/knowledge`)}
      submitButtonText="Update Artifact"
      editing={true}
    />
  );
}
