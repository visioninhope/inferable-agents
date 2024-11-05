using Inferable;

public static class Register
{
    public static void RegisterFunctions(InferableClient client)
    {
        client.Default.RegisterFunction(new FunctionRegistration<GetUrlContentInput> {
            Name = "getUrlContent",
            Description = "Gets the content of a URL",
            Func = new Func<GetUrlContentInput, object?>(input => HackerNewsService.GetUrlContent(input)),
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
    }
}
