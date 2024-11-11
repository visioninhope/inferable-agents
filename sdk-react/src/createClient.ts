import { initClient, tsRestFetchApi } from "@ts-rest/core";
import { contract } from "./contract";

/**
 * Provides raw API access to the Inferable API.
 */
export const createApiClient = ({
  baseUrl,
  clientAbortController,
  customerProvidedSecret,
  apiSecret,
}: {
  baseUrl?: string;
  clientAbortController?: AbortController;
  customerProvidedSecret?: string;
  apiSecret?: string
}) =>
  initClient(contract, {
    baseUrl: baseUrl ?? "https://api.inferable.ai",
    baseHeaders: {
      ...(customerProvidedSecret ? { authorization: `customer ${customerProvidedSecret}` } : {}),
      ...(apiSecret ?  {authorization: `bearer ${apiSecret}`} : {})
    },
    api: async (args) => {
      try {
        return await tsRestFetchApi({
          ...args,
          ...(clientAbortController
            ? { signal: clientAbortController.signal }
            : {}),
        });
      } catch (e) {
        return {
          status: -1,
          headers: new Headers(),
          body: e,
        };
      }
    },
  });
