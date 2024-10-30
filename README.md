<p align="center">
  <img src="https://a.inferable.ai/logo-hex.png" width="200" style="border-radius: 10px" />
</p>

[![Documentation](https://img.shields.io/badge/docs-inferable.ai-brightgreen)](https://docs.inferable.ai/) [![Discord](https://img.shields.io/badge/community-Discord-blue)](https://discord.gg/inferable) [![Website](https://img.shields.io/badge/website-inferable.ai-blue)](https://inferable.ai)
![NPM Version](https://img.shields.io/npm/v/inferable) ![GitHub go.mod Go version](https://img.shields.io/github/go-mod/go-version/inferablehq/inferable?filename=sdk-go%2Fgo.mod) ![NuGet Version](https://img.shields.io/nuget/v/inferable)

# Introduction

Inferable is the developer platform for building agentic automations from your existing code. You bring the code, we bring the automation engine.

## Key Features

### ✨ Developer Experience

- Create and manage automations programmatically with a delightful developer experience.
- Get started quickly with native SDKs for TypeScript, Go, and .NET, with more languages coming soon.
- Integrate seamlessly with your existing codebases and APIs. No rewrites required.

### 🤖 Managed Inference

- We handle the complexities of model routing, reasoning, and tool usage for you.
- Declaratively define complex multi-step workflows. You give us the objective, we handle the rest.
- Monitor everything in real-time with comprehensive tracing, logging, and analytics.

### 📈 Distributed Durable Execution

- We handle service discovery and load balancing for your functions.
- Our durable execution engine helps you recover from partial failures, and caches results for fast re-runs.

### 🔒 Security

- Keep your data secure and private - all compute runs within your infrastructure with no inbound connections required.
- Protect sensitive data with end-to-end encryption and masking capabilities built right in.

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
