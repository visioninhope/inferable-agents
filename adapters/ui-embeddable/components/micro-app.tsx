'use client'

import { useRun } from '@inferable/react'
import { useState } from 'react'
import './micro-app.css'

const clusterId = process.env.NEXT_PUBLIC_TEST_INFERABLE_CLUSTER_ID

if (!clusterId) {
  throw new Error('NEXT_PUBLIC_TEST_INFERABLE_CLUSTER_ID is not set')
}

export default function App() {
  const [isPaneOpen, setIsPaneOpen] = useState(false)
  const [input, setInput] = useState('')

  const { start, createMessage, messages } = useRun({
    clusterId: clusterId!,
    customAuthToken: '1234',
    onError: (error) => {
      console.error(error)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMessage({ type: 'human', message: input })
    setInput('')
  }

  const handlePaneOpen = () => {
    setIsPaneOpen(!isPaneOpen)
    if (!isPaneOpen) {
      // Start a new chat session when pane is opened
      start({
        initialPrompt: "Hello! I can help you update your address. What's your new address?",
      })
    }
  }

  return (
    <div className="h-full micro-app relative">
      <button
        className={`button ${isPaneOpen ? 'open' : ''}`}
        onClick={handlePaneOpen}
      >
        Update Address
      </button>

      {isPaneOpen && (
        <div className="pane">
          <div className="messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.type}`}>
                <strong>{msg.type === 'human' ? 'You' : 'Assistant'}:</strong> {JSON.stringify(msg, null, 2)}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="input-form">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your new address..."
              className="text-input"
            />
            <button type="submit" className="send-button">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
