import { useState } from 'react';
import { useInterval } from 'usehooks-ts';
import { createApiClient } from '../createClient';
import { contract } from '../contract';
import { ClientInferRequest, ClientInferResponseBody } from '@ts-rest/core';

type UseRunOptions = {
  clusterId: string;
  apiSecret?: string;
  customerProvidedSecret?: string;
  baseUrl?: string;
  pollInterval?: number;
}

type UseExistingRunOptions  = {
  runId: string;
  onMessage?: (messages: ListMessagesResponse) => void;
} & UseRunOptions;

type CreateMessageInput = ClientInferRequest<typeof contract['createMessage']>['body'];
type ListMessagesResponse = ClientInferResponseBody<typeof contract['listMessages'], 200>
type GetRunResponse = ClientInferResponseBody<typeof contract['getRun'], 200>

interface UseRunReturn {
  client: ReturnType<typeof createApiClient>;
  createMessage: (input: CreateMessageInput) => Promise<void>;
  messages: ListMessagesResponse;
  run?: GetRunResponse;
}

export function useRun(options: UseExistingRunOptions): UseRunReturn {
  if (!options.customerProvidedSecret && !options.apiSecret) {
    throw new Error('Must provide either customerProvidedSecret or apiSecret');
  }

  const [client] = useState(() => createApiClient({
    apiSecret: options.apiSecret,
    customerProvidedSecret: options.customerProvidedSecret,
    baseUrl: options.baseUrl
  }));

  const [messages, setMessages] = useState<ListMessagesResponse>([]);
  const [run, setRun] = useState<GetRunResponse>();

  useInterval(async () => {
      try {
        const [messageResponse, runResponse]  = await Promise.all([
          client.listMessages({
            params: {
              clusterId: options.clusterId,
              runId: options.runId
            }
          }),
          client.getRun({
            params: {
              clusterId: options.clusterId,
              runId: options.runId
            }
          })
        ]);

        if (messageResponse.status === 200) {
          setMessages(messageResponse.body);
        }

        if (runResponse.status === 200) {
          setRun(runResponse.body);
        }
      } catch (error) {
        console.error('Failed to poll run:', error);
      }
    }, options.pollInterval || 1000);

  const createMessage = async (input: CreateMessageInput) => {
    const response = await client.createMessage({
      params: {
        clusterId: options.clusterId,
        runId: options.runId
      },
      body: input
    });

    if (response.status !== 201) {
      throw new Error(`Could not create message. Status: ${response.status}`);
    }
  };

  return {
    client,
    createMessage,
    messages,
    run,
  };
}
