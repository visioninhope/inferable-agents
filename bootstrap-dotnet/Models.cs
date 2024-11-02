public struct HackerNewsPost
{
    public string Id { get; set; }
    public string Title { get; set; }
    public string Url { get; set; }
    public int Score { get; set; }
    public int CommentCount { get; set; }
}

public struct GetUrlContentInput
{
    public string Url { get; set; }
}

public struct ScorePostInput
{
    public int CommentCount { get; set; }
    public int Upvotes { get; set; }
}

public struct GeneratePageInput
{
    public string Markdown { get; set; }
}

public struct EmptyInput
{
    public string? Noop { get; set; }
}
