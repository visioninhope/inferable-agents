import React, { useState } from 'react';
import { useRun } from '../hooks/useRun';

export function TestPage() {
  const [message, setMessage] = useState('');
  const { createMessage, messages, run } = useRun({
    apiSecret: 'sk_yTEPGri7UDLaTLsDoyX4Rpqkq476KS7ZejCpPMpeYM',
    clusterId: '01JBECY8T5PT20XTTQMP2XVEE4',
    runId: '01JCC2NCPRXAN8VJP2F73REE1Y',
    baseUrl: 'http://localhost:4000'
  });

  const handleSubmit = async () => {
    await createMessage({
      message,
      type: 'human'
    });
    setMessage('');
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      gap: '20px',
      padding: '20px'
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
      <div style={{ width: '700px', overflowY: 'auto'}}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ margin: '8px 0' }}>
            <strong>{msg.type}:</strong>
            <pre>{JSON.stringify(msg, null, 2)}</pre>
          </div>
        ))}
      </div>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ padding: '8px' }}
      />
      <button
        onClick={handleSubmit}
        style={{ padding: '8px 16px' }}
      >
        Send Message
      </button>
      </div>
      <div style={{ width: '300px', padding: '10px', borderLeft: '1px solid #eee' }}>
        <h3>Run Status</h3>
        <pre>{JSON.stringify(run, null, 2)}</pre>
      </div>
    </div>
  );
}
