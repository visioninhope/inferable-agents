<p align="center">
  <img src="https://a.inferable.ai/logo-hex.png" width="200" style="border-radius: 10px" />
</p>

[![Documentation](https://img.shields.io/badge/docs-inferable.ai-brightgreen)](https://docs.inferable.ai/) [![Discord](https://img.shields.io/badge/community-Discord-blue)](https://discord.gg/inferable) [![Website](https://img.shields.io/badge/website-inferable.ai-blue)](https://inferable.ai)
![NPM Version](https://img.shields.io/npm/v/inferable) ![GitHub go.mod Go version](https://img.shields.io/github/go-mod/go-version/inferablehq/inferable?filename=sdk-go%2Fgo.mod) ![NuGet Version](https://img.shields.io/nuget/v/inferable)

# Introduction

Inferable is the developer platform for building agentic automations from your existing code. You bring the code, we bring the automation engine.

## Key Features

Here's a concise key features section with 5 points highlighting Inferable's main benefits:

🚀 **2-Minute Setup**: Get started in minutes with our [managed platform](https://app.inferable.ai) - wrap your existing functions, REST APIs, GraphQL endpoints, and more.

🔄 **Rapid Iteration**: Built for developers to quickly prototype, test and refine AI automations with instant feedback. If you can write a function, you can build an agent.

⚡️ **Distributed Durable Execution**: Our durable execution engine helps you agents recover from partial failures, load balance across your compute, and caches results for fast re-runs.

🛡️ **Zero Network Config**: No inbound connections or networking config required - your compute runs securely behind your firewall, and polls for instructions.

💻 **Your Infrastructure, Your Control**: Keep sensitive data and compute on-premise while leveraging our cloud orchestration. Inferable can't see or access any runtime information or environment variables.

🔌 **Multiple Language Support**: Native SDKs for TypeScript, Go, .NET and more coming soon - integrate with your existing codebase in minutes.

## SDKs

- [Node.js / TypeScript SDK](./sdk-node/README.md) [![npm version](https://badge.fury.io/js/inferable.svg)](https://badge.fury.io/js/inferable) [![Downloads](https://img.shields.io/npm/dm/inferable)](https://www.npmjs.com/package/inferable)
- [Go SDK](./sdk-go/README.md)
- [.NET SDK](./sdk-dotnet/README.md)

Each SDK directory contains its own README with specific installation instructions, quick start guide, and usage examples.

## Quick Start

For language-specific quick start guides, please refer to the README in each SDK's directory:

- [Node.js / TypeScript Quick Start](./sdk-node/README.md#quick-start)
- [Go Quick Start](./sdk-go/README.md#quick-start)
- [.NET Quick Start](./sdk-dotnet/README.md#quick-start)

## Feature Comparison

### Core Features

| Feature                                                         | Node.js | Go  | .NET |
| --------------------------------------------------------------- | :-----: | :-: | :--: |
| Register [Functions](https://docs.inferable.ai/pages/functions) |   ✅    | ✅  |  ✅  |
| Create [Runs](https://docs.inferable.ai/pages/runs)             |   ✅    | ✅  |  ❌  |

### Advanced Features

| Feature                                                               | Node.js | Go  | .NET |
| --------------------------------------------------------------------- | :-----: | :-: | :--: |
| Create [Blob](https://docs.inferable.ai/pages/functions#blob) results |   ✅    | ❌  |  ❌  |
| [Mask](https://docs.inferable.ai/pages/functions#masked) results      |   ✅    | ❌  |  ❌  |
| Visibility timeout configuration                                      |   ✅    | ❌  |  ❌  |
| Retry configuration                                                   |   ✅    | ❌  |  ❌  |

## Documentation

For comprehensive documentation on using Inferable AI, please visit our [official documentation](https://docs.inferable.ai/).

## Contributing

We welcome contributions to all our SDKs. Please read our [contributing guidelines](./CONTRIBUTING.md) before submitting any pull requests.

## License

All SDKs in this repository are licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
