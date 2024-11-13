import { useCallback, useMemo, useState } from 'react';
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
  onError?: (error: Error) => void;
}

type UseExistingRunOptions  = {
  runId: string;
} & UseRunOptions;

type UseNewRunOptions  = {
  configId: string;
  initialPrompt?: string;
  configInput?: Record<string, unknown>;
} & UseRunOptions;

type CreateMessageInput = ClientInferRequest<typeof contract['createMessage']>['body'];
type ListMessagesResponse = ClientInferResponseBody<typeof contract['listMessages'], 200>
type GetRunResponse = ClientInferResponseBody<typeof contract['getRun'], 200>

interface UseRunReturn {
  client: ReturnType<typeof createApiClient>;
  createMessage: (input: CreateMessageInput) => Promise<void>;
  messages: ListMessagesResponse;
  run?: GetRunResponse;
  start: () => void;
}

export function useRun(options: UseExistingRunOptions | UseNewRunOptions): UseRunReturn {
  const [client] = useState(() => createApiClient({
    apiSecret: options.apiSecret,
    customerProvidedSecret: options.customerProvidedSecret,
    baseUrl: options.baseUrl
  }));

  const [messages, setMessages] = useState<ListMessagesResponse>([]);
  const [run, setRun] = useState<GetRunResponse>();
  const [runId, setRunId] = useState<string>();

  const hasStarted = useMemo(() => ({ current: false }), [])

  const start = useCallback(async () => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    console.log('start');
    if (!client) return;
    if (!options.customerProvidedSecret && !options.apiSecret) {
      options.onError?.(new Error('Must provide either customerProvidedSecret or apiSecret'));
    }

    if (
      ('runId' in options && 'configId' in options) ||
        !('runId' in options) && !('configId' in options)
    ) {
      options.onError?.(new Error('Must provide either runId or configId but not both'));
    }

    if ('runId' in options) {
      setRunId(options.runId);
      return;
    }

    if ('configId' in options) {
      try {
        const response = await client.createRun({
          body: {
            initialPrompt: options.initialPrompt,
            config: {
              id: options.configId,
              input: options.configInput
            },
          },
          params: {
            clusterId: options.clusterId
          }
        });

        if (response.status !== 201) {
          options.onError?.(new Error(`Could not create run. Status: ${response.status} Body: ${JSON.stringify(response.body)}`));
        } else {
          setRunId(response.body.id);
        }
      } catch (error) {
        options.onError?.(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }, [client, options, hasStarted]);

  useInterval(async () => {
    if (!runId) return;
    try {
      const [messageResponse, runResponse]  = await Promise.all([
        client.listMessages({
          params: {
            clusterId: options.clusterId,
            runId: runId
          }
        }),
        client.getRun({
          params: {
            clusterId: options.clusterId,
            runId: runId
          }
        })
      ]);

        if (messageResponse.status === 200) {
          setMessages(messageResponse.body);
        } else {
          options.onError?.(new Error(`Could not list messages. Status: ${messageResponse.status} Body: ${JSON.stringify(messageResponse.body)}`));
        }

        if (runResponse.status === 200) {
          setRun(runResponse.body);
        } else {
          options.onError?.(new Error(`Could not get run. Status: ${runResponse.status}`));
        }

      } catch (error) {
        options.onError?.(error instanceof Error ? error : new Error(String(error)));
      }
    }, options.pollInterval || 1000);

  const createMessage = async (input: CreateMessageInput) => {
    if (!runId) return;

    const response = await client.createMessage({
      params: {
        clusterId: options.clusterId,
        runId,
      },
      body: input
    });

    if (response.status !== 201) {
      options.onError?.(new Error(`Could not create message. Status: ${response.status} Body: ${JSON.stringify(response.body)}`));
    }
  };

  return {
    client,
    createMessage,
    messages,
    run,
    start,
  };
}
