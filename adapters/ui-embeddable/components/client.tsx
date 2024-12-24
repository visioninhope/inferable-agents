import { initClient } from "@ts-rest/core";
import { contract } from "./contract";
import { useEffect, useState } from "react";

const isServer = typeof window === "undefined";

const getBaseUrl = () => {
  if (isServer) {
    return `${process.env.NEXT_PUBLIC_INFERABLE_API_URL || "https://api.inferable.ai"}`;
  }

  return `/api`;
};

const client = (customAuthToken: string) => initClient(contract, {
  baseUrl: getBaseUrl(),
  baseHeaders: {
    authorization: `custom ${customAuthToken}`,
  },
});

export const useClient = (customAuthToken: string) => {
  const [c, setC] = useState<ReturnType<typeof client> | null>(null);

  useEffect(() => {
    setC(client(customAuthToken));
  }, [customAuthToken]);

  return c;
};
