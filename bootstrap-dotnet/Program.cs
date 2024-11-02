using DotNetEnv;
using Inferable;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<InferableClient>(sp => {
    var options = new InferableOptions {
        ApiSecret = System.Environment.GetEnvironmentVariable("INFERABLE_API_SECRET"),
        BaseUrl = System.Environment.GetEnvironmentVariable("INFERABLE_API_ENDPOINT"),
    };

    var logger = sp.GetRequiredService<ILogger<InferableClient>>();
    return new InferableClient(options, logger);
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    Env.Load();
}

var client = app.Services.GetService<InferableClient>();

if (client == null)
{
    throw new Exception("Could not get InferableClient");
}

client.Default.RegisterFunction(new FunctionRegistration<GetUrlContentInput> {
    Name = "getUrlContent",
    Description = "Gets the content of a URL",
    Func = new Func<GetUrlContentInput, object?>(input => HackerNewsService.GetUrlContent(input))
});

client.Default.RegisterFunction(new FunctionRegistration<ScorePostInput> {
    Name = "scoreHNPost",
    Description = "Calculates a score for a Hacker News post given its comment count and upvotes",
    Func = new Func<ScorePostInput, object?>(input => HackerNewsService.ScoreHNPost(input))
});

client.Default.RegisterFunction(new FunctionRegistration<GeneratePageInput> {
    Name = "generatePage",
    Description = "Generates a page from markdown",
    Func = new Func<GeneratePageInput, object?>(input => HackerNewsService.GeneratePage(input))
});

_ = client.Default.StartAsync();

app.Run();

