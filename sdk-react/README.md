<p align="center">
  <img src="https://a.inferable.ai/logo-hex.png" width="200" style="border-radius: 10px" />
</p>

# React SDK

[![npm version](https://badge.fury.io/js/%40inferable%2Freact.svg)](https://badge.fury.io/js/%40inferable%2Freact)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Documentation](https://img.shields.io/badge/docs-inferable.ai-brightgreen)](https://docs.inferable.ai/)

This is the official Inferable AI SDK for React.
It is used to start and interact with [Inferable runs](https://docs.inferable.ai/pages/runs) from React applications.

It does **not** currently support [registering functions](https://docs.inferable.ai/pages/functions) as the backend SDKs do.

## Installation

```bash
npm install @inferable/react
```

```bash
yarn add @inferable/react
```

```bash
pnpm add @inferable/react
```

## Quick Start

### useRun Hook

The `useRun` hook provides real-time interaction with an Inferable run:


#### Existing Runs
It can be used to interact with an existing run by specifying the `runId`:
```typescript
const { messages, run, createMessage, start } = useRun({
  clusterId: 'your-cluster-id',
  customerProvidedSecret: 'your-customer-provided-secret',
  runId: 'your-run-id',
  // pollInterval: 1000, // Optional: defaults to 1000ms
});
```


#### New Runs

It can be used to create a new run by specifying a `configId`:

```typescript
const { messages, run, createMessage, start } = useRun({
  clusterId: 'your-cluster-id',
  customerProvidedSecret: 'your-customer-provided-secret',
  initialMessage: 'Hello!',
  configId: 'your-run-config-id',
  // configInput: {} // Optional: if the config has an inputSchema
  // pollInterval: 1000, // Optional: defaults to 1000ms
});
```

#### Start

Once the hook is initialized, you can start the run by calling the `start` function:

```typescript
start()

// Access messages and run state
console.log(messages); // Array of messages in the run
console.log(run); // Current run status and metadata
```


#### Adding Messages

You can add messages to the run by calling the `createMessage` function:

```typescript
// Optional: Send follow-up messages
await createMessage({
  message: 'Hello!',
  type: 'human'
});

```

## Local Development

There is development server included in the repository at `./test-page`.

1. Start the development server:
```bash
npm run dev
```

This will start a Vite dev server at http://localhost:3000 with the test page, which provides a simple interface to test the SDK's functionality.

## Documentation

- [Inferable documentation](https://docs.inferable.ai/) contains all the information you need to get started with Inferable.

## Support

For support or questions, please [create an issue in the repository](https://github.com/inferablehq/inferable/issues) or [join the Discord](https://go.inferable.ai/discord)

## Contributing

Contributions to the Inferable React SDK are welcome. Please ensure that your code adheres to the existing style and includes appropriate tests.
