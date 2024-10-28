<p align="center">
  <img src="https://a.inferable.ai/logo.png?v=2" width="200" style="border-radius: 10px" />
</p>

# .NET SDK for Inferable

[![NuGet version](https://img.shields.io/nuget/v/Inferable.svg)](https://www.nuget.org/packages/Inferable/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Documentation](https://img.shields.io/badge/docs-inferable.ai-brightgreen)](https://docs.inferable.ai/)

The **Inferable .NET Client** is a .NET library that allows you to interact with the Inferable API. This library provides functionality to register your .NET functions, manage services, and handle API communication easily.

## Installation

To install the Inferable .NET Client, use the following command in your project:

```bash
dotnet add package Inferable
```

## Quick Start

### Initializing the Client

To create a new Inferable client, use the `InferableClient` class:

```csharp
using Inferable;

var options = new InferableOptions
{
    ApiSecret = "your-api-secret", // Replace with your API secret
    BaseUrl = "https://api.inferable.ai" // Optional, uses default if not provided
};

var client = new InferableClient(options);
```

If you don't provide an API key or base URL, it will attempt to read them from the following environment variables:

- `INFERABLE_API_SECRET`
- `INFERABLE_API_ENDPOINT`

### Registering a Function

To register a function with the Inferable API, you can use the following:

```csharp
public class MyInput
{
    public string Message { get; set; }
}

client.Default.RegisterFunction(new FunctionRegistration<MyInput>
{
    Function = new Func<MyInput, MyResult>>((input) => {
        // Your code here
    }),
    Name = "SayHello",
    Description = "A simple greeting function",
});

await client.Default.Start();
```

### 3. Trigger a run

The following code will create an [Inferable run](https://docs.inferable.ai/pages/runs) with the message "Call the testFn" and the `TestFn` function attached.

> You can inspect the progress of the run:
>
> - in the [playground UI](https://app.inferable.ai/) via `inf app`
> - in the [CLI](https://www.npmjs.com/package/@inferable/cli) via `inf runs list`

```csharp
var run = await inferable.CreateRun(new CreateRunInput
{
  Message = "Call the testFn",
  AttachedFunctions = new List<FunctionReference>
  {
    new FunctionReference {
      Function = "TestFn",
      Service = "default"
    }
  },
  // Optional: Subscribe an Inferable function to receive notifications when the run status changes
  //OnStatusChange = new CreateOnStatusChangeInput
  //{
  //  Function = OnStatusChangeFunction
  //}
});

// Wait for the run to complete and log.
var result = await run.Poll(null);
```

> Runs can also be triggered via the [API](https://docs.inferable.ai/pages/invoking-a-run-api), [CLI](https://www.npmjs.com/package/@inferable/cli) or [playground UI](https://app.inferable.ai/).

## Contributing

Contributions to the Inferable .NET Client are welcome. Please ensure that your code adheres to the existing style and includes appropriate tests.

## Support

For support or questions, please [create an issue in the repository](https://github.com/inferablehq/inferable/issues).
