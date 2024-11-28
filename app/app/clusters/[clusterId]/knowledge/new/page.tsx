"use client";

import { useAuth } from "@clerk/nextjs";
import { client } from "@/client/client";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { ulid } from "ulid";
import {
  KnowledgeArtifactForm,
  KnowledgeArtifact,
} from "@/components/KnowledgeArtifactForm";
import { createErrorToast } from "@/lib/utils";

export default function NewKnowledgeArtifact() {
  const { getToken } = useAuth();
  const params = useParams();
  const router = useRouter();
  const clusterId = params?.clusterId as string;

  const handleCreate = async (newArtifact: KnowledgeArtifact) => {
    try {
      const token = await getToken();
      const newId = ulid();
      const response = await client.upsertKnowledgeArtifact({
        params: { clusterId, artifactId: newId },
        headers: { authorization: token as string },
        body: newArtifact,
      });

      if (response.status === 200) {
        toast.success("Knowledge artifact created successfully");
        router.push(`/clusters/${clusterId}/knowledge`);
      } else {
        createErrorToast(response, "Failed to create knowledge artifact");
      }
    } catch (error) {
      console.error("Error creating artifact:", error);
      toast.error("Failed to create knowledge artifact");
    }
  };

  const handleCancel = () => {
    router.push(`/clusters/${clusterId}/knowledge`);
  };

  return (
    <KnowledgeArtifactForm
      onSubmit={handleCreate}
      onCancel={handleCancel}
      submitButtonText="Create Artifact"
      editing={false}
    />
  );
}
