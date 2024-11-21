<p align="center">
  <img src="https://a.inferable.ai/logo-hex.png" width="200" style="border-radius: 10px" />
</p>

<div align="center">

[![Website](https://img.shields.io/badge/website-inferable.ai-blue)](https://inferable.ai) [![Documentation](https://img.shields.io/badge/docs-inferable.ai-brightgreen)](https://docs.inferable.ai/) [![Discord](https://img.shields.io/badge/community-Discord-blue)](https://go.inferable.ai/discord) [![Slack](https://img.shields.io/badge/enterprise-Slack-blue)](https://go.inferable.ai/slack)

![NPM Version](https://img.shields.io/npm/v/inferable?color=32CD32) ![GitHub go.mod Go version](https://img.shields.io/github/go-mod/go-version/inferablehq/inferable?filename=sdk-go%2Fgo.mod&color=32CD32) ![NuGet Version](https://img.shields.io/nuget/v/inferable?color=32CD32)

</div>

# Introduction

Inferable is a developer platform that makes it easy to build and deploy reliable, secure LLM-based applications.

## Key Features

🚀 **[2-Minute Setup](https://docs.inferable.ai/pages/quick-start)**: Get started in minutes with our [managed platform](https://app.inferable.ai) - wrap your existing functions, REST APIs and GraphQL endpoints as tools.

🤖 **[Managed Agent Runtime](https://docs.inferable.ai/pages/runs)**: Managed [ReAct](https://www.promptingguide.ai/techniques/react)-like agent runtime powered by your own functions.

⚡️ **[Durable Tool Calling](https://docs.inferable.ai/pages/functions)**: Our durable execution engine helps you agents recover from tool-calling failures, load balance across your compute, and caches results for fast re-runs.

🛡️ **[Zero Network Config](https://docs.inferable.ai/pages/no-incoming-connections)**: No inbound connections or networking config required - your compute runs securely behind your firewall, and polls Inferable for instructions.

💻 **[Your Infrastructure](https://docs.inferable.ai/pages/on-premise)**: All functions run on your Infrastructure - Keep sensitive data and compute on-premise while leveraging our agent runtime. Inferable can't see or access any runtime information or environment variables.

🔌 **Multiple Language Support**: Native SDKs for TypeScript, Go, .NET and more coming soon - integrate with your existing codebase in minutes.

## SDKs

- [Node.js / TypeScript SDK](./sdk-node/README.md)
- [Go SDK](./sdk-go/README.md)
- [.NET SDK](./sdk-dotnet/README.md)
- [React SDK](./sdk-react/README.md)

Each SDK directory contains its own README with specific installation instructions, quick start guide, and usage examples.

## Quick Start

For language-specific quick start guides, please refer to the README in each SDK's directory:

- [Node.js / TypeScript Quick Start](./sdk-node/README.md#quick-start)
- [Go Quick Start](./sdk-go/README.md#quick-start)
- [.NET Quick Start](./sdk-dotnet/README.md#quick-start)
- [React Quick Start](./sdk-react/README.md#quick-start)

## Feature Comparison

### Core Features

| Feature                                                         | Node.js | Go  | .NET | React |
| --------------------------------------------------------------- | :-----: | :-: | :--: | :---: |
| Register [Functions](https://docs.inferable.ai/pages/functions) |   ✅    | ✅  |  ✅  |  ❌   |
| Create [Runs](https://docs.inferable.ai/pages/runs)             |   ✅    | ✅  |  ✅  |  ✅   |

### Advanced Features

| Feature                                                                                                | Node.js | Go  | .NET |
| ------------------------------------------------------------------------------------------------------ | :-----: | :-: | :--: |
| [Cached](https://docs.inferable.ai/pages/functions#config-cache) results                               |   ✅    | ❌  |  ❌  |
| Call [Timeouts](https://docs.inferable.ai/pages/functions#config-timeoutseconds)                       |   ✅    | ❌  |  ❌  |
| Call [Retries](https://docs.inferable.ai/pages/functions#config-retrycountonstall)                     |   ✅    | ❌  |  ❌  |
| Call [Approval](https://docs.inferable.ai/pages/functions#approvalrequest) (Human in the loop)        |   ✅    | ❌  |  ❌  |
| [Auth / Run Context](https://docs.inferable.ai/pages/runs#context)                                     |   ✅    | ❌  |  ❌  |

## Documentation

For comprehensive documentation on using Inferable AI, please visit our [official documentation](https://docs.inferable.ai/).

## Contributing

We welcome contributions to all our SDKs. Please read our [contributing guidelines](./CONTRIBUTING.md) before submitting any pull requests.

## License

- All SDKs in this repository are licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
- Inferable Cloud is currently a proprietary closed-source product.
