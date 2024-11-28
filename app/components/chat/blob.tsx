import { client } from "@/client/client";
import { BlobDetails } from "@/lib/types";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { ReadOnlyJSON } from "../read-only-json";

export function Blob({
  blob,
  clusterId,
}: {
  blob: BlobDetails;
  clusterId: string;
}) {
  const { getToken } = useAuth();
  const [fetching, setFetching] = useState(true);
  const [data, setData] = useState<string | null>(null);

  const fetchBlobData = useCallback(async () => {
    const response = await client.getBlobData({
      headers: {
        authorization: `Bearer ${await getToken()}`,
      },
      params: {
        blobId: blob.id,
        clusterId,
      },
    });

    if (response.status === 200) {
      setData(response.body);
    }
    setFetching(false);
  }, [blob.id, clusterId, getToken]);

  useEffect(() => {
    fetchBlobData();
  }, [blob.id, blob.name, fetchBlobData]);

  return (
    <div className="">
      <p className="text-xs ml-6 text-muted-foreground mb-2">
        {fetching ? "Loading..." : blob.name}
      </p>
      {data && blob.type === "application/json" && (
        <div className="text-xs ml-6 text-muted-foreground mb-2">
          <ReadOnlyJSON
            json={JSON.stringify(
              JSON.parse(Buffer.from(data, "base64").toString()),
              null,
              2,
            )}
          />
        </div>
      )}
      {data && blob.type === "image/png" && (
        <img
          className="w-1/2 mx-auto"
          src={`data:image/png;base64,${data}`}
          alt={blob.name}
        />
      )}
    </div>
  );
}
