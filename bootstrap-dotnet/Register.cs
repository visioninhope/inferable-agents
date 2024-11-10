using Inferable;
using System.Text.Json.Serialization;

// Input Models
public struct GetUrlContentInput
{
    [JsonPropertyName("url")]
    public string Url { get; set; }
}

public struct ScorePostInput
{
    [JsonPropertyName("commentCount")]
    public int CommentCount { get; set; }
    [JsonPropertyName("upvotes")]
    public int Upvotes { get; set; }
}

public struct GeneratePageInput
{
    [JsonPropertyName("markdown")]
    public string Markdown { get; set; }
}

public struct EmptyInput
{
    [JsonPropertyName("noop")]
    public string? Noop { get; set; }
}

// Response Models
[JsonSerializable(typeof(UrlContentResponse))]
public class UrlContentResponse
{
    [JsonPropertyName("body")]
    public string? Body { get; set; }
    [JsonPropertyName("error")]
    public string? Error { get; set; }
    [JsonPropertyName("supervisor")]
    public string? Supervisor { get; set; }
    [JsonPropertyName("message")]
    public string? Message { get; set; }
    [JsonPropertyName("response")]
    public string? Response { get; set; }
}

public class GeneratePageResponse
{
    [JsonPropertyName("message")]
    public string? Message { get; set; }

    [JsonPropertyName("tmpPath")]
    public string? TmpPath { get; set; }
}

public class ScorePostResponse
{
    [JsonPropertyName("score")]
    public int Score { get; set; }
}

public static class Register
{
    public static void RegisterFunctions(InferableClient client)
    {
        client.Default.RegisterFunction(new FunctionRegistration<GetUrlContentInput> {
            Name = "getUrlContent",
            Description = "Gets the content of a URL",
            Func = new Func<GetUrlContentInput, object?>(HackerNewsService.GetUrlContent),
        });

        client.Default.RegisterFunction(new FunctionRegistration<ScorePostInput> {
            Name = "scoreHNPost",
            Description = "Calculates a score for a Hacker News post given its comment count and upvotes",
            Func = new Func<ScorePostInput, object?>(input => HackerNewsService.ScoreHNPost(input))
        });

        client.Default.RegisterFunction(new FunctionRegistration<GeneratePageInput> {
            Name = "generatePage",
            Description = "Generates a page from markdown",
            Func = new Func<GeneratePageInput, object?>(HackerNewsService.GeneratePage)
        });
    }
}
