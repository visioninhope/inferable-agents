using System.Text.Json.Serialization;

public struct HackerNewsPost
  {
    [JsonPropertyName("id")]
    public string Id { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; }

    [JsonPropertyName("url")]
    public string Url { get; set; }

    [JsonPropertyName("score")]
    public int Score { get; set; }

    [JsonPropertyName("commentCount")]
    public int CommentCount { get; set; }
}

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
