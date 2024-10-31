using DotNetEnv;
using Inferable;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<InferableClient>(sp => {
    var options = new InferableOptions {
      // To get a new key, run:
      // npx @inferable/cli auth keys create 'My New Machine Key' --type='cluster_machine'
      ApiSecret = System.Environment.GetEnvironmentVariable("INFERABLE_API_SECRET"),
      BaseUrl = System.Environment.GetEnvironmentVariable("INFERABLE_API_ENDPOINT"),
    };

    var logger = sp.GetRequiredService<ILogger<InferableClient>>();

    return new InferableClient(options, logger);
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
  // Load vars from .env file
  Env.Load();
}

var client = app.Services.GetService<InferableClient>();

if (client == null)
{
  throw new Exception("Could not get InferableClient");
}

client.Default.RegisterFunction(new FunctionRegistration<SearchInput> {
    Name = "SearchInventory",
    Description = "Searches the inventory",
    Func = new Func<SearchInput, object?>(input => InventorySystem.SearchInventory(input))
    });

client.Default.RegisterFunction(new FunctionRegistration<GetInventoryItemInput> {
    Name = "GetInventoryItem",
    Description = "Gets an inventory item",
    Func = new Func<GetInventoryItemInput, object?>(input => InventorySystem.GetInventoryItem(input))
    });

client.Default.RegisterFunction(new FunctionRegistration<EmptyInput> {
    Name = "ListOrders",
    Description = "Lists all orders",
    Func = new Func<EmptyInput, object?>(input => InventorySystem.ListOrders())
    });

client.Default.RegisterFunction(new FunctionRegistration<EmptyInput> {
    Name = "TotalOrderValue",
    Description = "Calculates the total value of all orders",
    Func = new Func<EmptyInput, object?>(input => InventorySystem.TotalOrderValue())
});

client.Default.RegisterFunction(new FunctionRegistration<MakeOrderInput> {
    Name = "MakeOrder",
    Description = "Makes an order",
    Func = new Func<MakeOrderInput, object?>(input => InventorySystem.MakeOrder(input))
    });

_ = client.Default.StartAsync();

var run = await client.CreateRunAsync(new Inferable.API.CreateRunInput
{
  Message = "Can you make an order for 2 lightsabers?",
  // Optional: Explicitly attach the `sayHello` function (All functions attached by default)
  // AttachedFunctions = new List<FunctionReference>
  // {
  //   new FunctionReference {
  //     Function = "SayHello",
  //     Service = "default"
  //   }
  // },
  // Optional: Define a schema for the result to conform to
  //ResultSchema = JsonSchema.FromType<RunOutput>();
  // Optional: Subscribe an Inferable function to receive notifications when the run status changes
  //OnStatusChange = new OnStatusChange<RunOutput>
  //{
  //  Function = OnStatusChangeFunction
  //}
});

Console.WriteLine($"Run started: {run.ID}");

// Wait for the run to complete and log
var result = await run.PollAsync(null);

Console.WriteLine($"Run result: {result}");

app.Run();

