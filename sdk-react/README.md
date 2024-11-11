<p align="center">
  <img src="https://a.inferable.ai/logo-hex.png" width="200" style="border-radius: 10px" />
</p>

# React SDK

[![npm version](https://badge.fury.io/js/%40inferable%2Freact.svg)](https://badge.fury.io/js/%40inferable%2Freact)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Documentation](https://img.shields.io/badge/docs-inferable.ai-brightgreen)](https://docs.inferable.ai/)

This is the official Inferable AI SDK for React.

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

## Usage

### useRun Hook

The `useRun` hook provides real-time interaction with an Inferable run:

```typescript
const { messages, run, createMessage, start } = useRun({
  clusterId: 'your-cluster-id',
  customerProvidedSecret: 'your-customer-provided-secret',
  // apiSecret: 'your-api-secret', // Not recomended for frontend usage
  // Existing Run:
  // runId: 'your-run-id',
  // New (From Run Config):
  // initialMessage: 'Hello!',
  // configId: 'your-run-config-id',
  // configInput: {} //optional if `initialPrompt` is not provided,
  // pollInterval: 1000, // Optional: defaults to 1000ms
});

// start()

// Access messages and run state
console.log(messages); // Array of messages in the run
console.log(run); // Current run status and metadata


// Optional: Send follow-up messages
await createMessage({
  message: 'Hello!',
  type: 'human'
});

```

The hook automatically polls for updates to messages and run status at the specified interval.

## Local Development

To test the SDK locally:

1. Start the development server:
```bash
npm run dev
```

This will start a Vite dev server at http://localhost:3000 with the test page, which provides a simple interface to test the SDK's functionality.

## Documentation

- [Inferable documentation](https://docs.inferable.ai/) contains all the information you need to get started with Inferable.

## Support

For support or questions, please [create an issue in the repository](https://github.com/inferablehq/inferable/issues) or [join the Discord](https://discord.gg/WHcTNeDP)

## Contributing

Contributions to the Inferable React SDK are welcome. Please ensure that your code adheres to the existing style and includes appropriate tests.
