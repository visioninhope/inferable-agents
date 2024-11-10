using DotNetEnv;
using Inferable;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

class Program
{
    static async Task Main(string[] args)
    {
        // Load environment variables in development
        if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
        {
            Env.Load();
        }

        // Setup dependency injection
        var services = new ServiceCollection();

        // Add logging
        services.AddLogging(builder => {
            builder.AddConsole();
        });

        // Configure Inferable client
        services.AddSingleton<InferableClient>(sp => {
            var options = new InferableOptions {
                ApiSecret = Environment.GetEnvironmentVariable("INFERABLE_API_SECRET"),
                BaseUrl = Environment.GetEnvironmentVariable("INFERABLE_API_ENDPOINT"),
            };

            var logger = sp.GetRequiredService<ILogger<InferableClient>>();
            return new InferableClient(options, logger);
        });

        var serviceProvider = services.BuildServiceProvider();
        var client = serviceProvider.GetRequiredService<InferableClient>();

        // Check command line arguments
        if (args.Length > 0 && args[0].ToLower() == "run")
        {
            Console.WriteLine("Running HN extraction...");
            await RunHNExtraction.RunAsync(client);
        }
        else
        {
            Console.WriteLine("Starting client...");
            Register.RegisterFunctions(client);
            await client.Default.StartAsync();

            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();
        }
    }
}


