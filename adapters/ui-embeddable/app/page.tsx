"use client";

import MicroApp from '@/components/micro-app'
import { useState } from 'react';
import { z } from 'zod';

const clusterId = process.env.NEXT_PUBLIC_TEST_INFERABLE_CLUSTER_ID;

if (!clusterId) {
  throw new Error("NEXT_PUBLIC_TEST_INFERABLE_CLUSTER_ID is not set");
}

export default function Home() {
  const [result, setResult] = useState<unknown>(null);

  return (
    <div className="">
      <main>
        <div style={{
          paddingBottom: "1rem",
        }}>
          <MicroApp initialMessage="Is the server running?" clusterId={clusterId!} customAuthToken="test" />
        </div>
        <div style={{
          paddingBottom: "1rem",
        }}>
          <MicroApp initialMessage="Is the server running?" clusterId={clusterId!} customAuthToken="test" userInputSchema={{
            "How many times do you want to ping the server?": z.string(),
          }} />
        </div>
        <div style={{
          paddingBottom: "1rem",
        }}>
          <MicroApp initialMessage="Is the server running?" clusterId={clusterId!} customAuthToken="test" resultSchema={z.object({
            rawResult: z.string(),
            numberOfPings: z.number(),
          })} onResult={setResult} />
          {result ? <div>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div> : null}
        </div>
      </main>
    </div>
  )
}
