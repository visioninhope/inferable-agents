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

## Usage

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
    Name = "MyFunction",
    Description = "A simple greeting function",
});

await client.Default.Start();
```

### Starting and Stopping a Service

The example above used the Default service, you can also register separate named services.

```csharp
var userService = client.RegisterService(new ServiceRegistration
{
  Name = "UserService",
});

userService.RegisterFunction(....)

await userService.Start();
```

To stop the service, use:

```csharp
await userService.StopAsync();
```

## Contributing

Contributions to the Inferable .NET Client are welcome. Please ensure that your code adheres to the existing style and includes appropriate tests.

## Support

For support or questions, please [create an issue in the repository](https://github.com/inferablehq/inferable-dotnet/issues).
