'use client'

import { useClient } from './client';
import './micro-app.css'
import { useState } from 'react'

const clusterId = process.env.NEXT_PUBLIC_TEST_INFERABLE_CLUSTER_ID;

if (!clusterId) {
  throw new Error('NEXT_PUBLIC_TEST_INFERABLE_CLUSTER_ID is not set');
}

export default function App() {
  const [isPaneOpen, setIsPaneOpen] = useState(false);

  const customAuthToken = `1234`

  const client = useClient(customAuthToken);

  const handleClick = async () => {
    const run = await client?.createRun({
      params: {
        clusterId: "01J7M4V93BBZP3YJYSKPDEGZ2T",
      },
      body: {

      }
    });
  }

  return (
    <div className="h-full micro-app relative">
      <button
        className={`button ${isPaneOpen ? 'open' : ''}`}
        onClick={() => setIsPaneOpen(!isPaneOpen)}
      >
        Update Address
      </button>

      {isPaneOpen && (
        <div className="pane">
          <p className="text-sm text-gray-600">just a sec...</p>
        </div>
      )}
    </div>
  )
}
