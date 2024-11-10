using System.Diagnostics;
using Inferable;
using System.Text.Json;
using Inferable.API;
using NJsonSchema;
using System.Text.Json.Serialization;
using System.Collections.ObjectModel;

public class Post
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = "";

    [JsonPropertyName("title")]
    public string Title { get; set; } = "";

    [JsonPropertyName("points")]
    public string Points { get; set; } = "";

    [JsonPropertyName("comments_url")]
    public string CommentsUrl { get; set; } = "";
}

public class KeyPoint
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = "";

    [JsonPropertyName("title")]
    public string Title { get; set; } = "";

    [JsonPropertyName("key_points")]
    public List<string> KeyPoints { get; set; } = new();
}

public class GeneratePageResult
{
    [JsonPropertyName("page_path")]
    public string PagePath { get; set; } = "";
}

public class ExtractResult
{
    [JsonPropertyName("posts")]
    public Collection<Post> Posts { get; set; } = new();
}


public static class RunHNExtraction
{
    private static void OpenInferableInBrowser()
    {
        try
        {
            var clusterId = Environment.GetEnvironmentVariable("INFERABLE_CLUSTER_ID");
            var url = $"https://app.inferable.ai/clusters";

            if (!string.IsNullOrEmpty(clusterId))
            {
                url += $"/{clusterId}/runs";
            }

            if (OperatingSystem.IsWindows())
            {
                Process.Start(new ProcessStartInfo("cmd", $"/c start {url}") { CreateNoWindow = true });
            }
            else if (OperatingSystem.IsMacOS())
            {
                Process.Start("open", url);
            }
            else if (OperatingSystem.IsLinux())
            {
                Process.Start("xdg-open", url);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to open browser: {ex.Message}");
        }
    }

    public static async Task RunAsync(InferableClient? client = null)
    {
        // Use the provided client or create a new one if none is provided
        client ??= new InferableClient(new InferableOptions
        {
            ApiSecret = Environment.GetEnvironmentVariable("INFERABLE_API_SECRET"),
            BaseUrl = Environment.GetEnvironmentVariable("INFERABLE_API_ENDPOINT")
        });

        OpenInferableInBrowser();

        // Extract top posts
        var extractRun = await client.CreateRunAsync(new Inferable.API.CreateRunInput
        {
            InitialPrompt = @"
                Hacker News has a homepage at https://news.ycombinator.com/
                Each post has a id, title, a link, and a score, and is voted on by users.
                Score the top 10 posts and pick the top 3 according to the internal scoring function.",
            CallSummarization = false,
            ResultSchema = JsonSchema.FromType<ExtractResult>()
        });

        var extractResult = await extractRun.PollAsync(null);

        if (extractResult.GetValueOrDefault().Result == null)
        {
            throw new Exception("No result found in extract run");
        }

        var posts = JsonSerializer.Deserialize<ExtractResult>(extractResult.GetValueOrDefault().Result?.ToString()!);

        if (posts?.Posts == null)
        {
            throw new Exception("No posts found in extract result");
        }

        // Summarize each post
        var summaryTasks = new List<Task<GetRunResult?>>();
        foreach (var post in posts.Posts)
        {
            var summarizeRun = await client.CreateRunAsync(new CreateRunInput
            {
                InitialPrompt = $@"
                    <data>
                        {JsonSerializer.Serialize(post)}
                    </data>

                    You are given a post from Hacker News, and a url for the post's comments.
                    Summarize the comments. You should visit the comments URL to get the comments.
                    Produce a list of the key points from the comments.",
                ResultSchema = JsonSchema.FromType<KeyPoint>()
            });

            summaryTasks.Add(summarizeRun.PollAsync(null));
        }

        // Wait for all summaries to complete
        var summaryResults = await Task.WhenAll(summaryTasks);
        var summaries = new List<KeyPoint>();

        foreach (var result in summaryResults)
        {
            if (result?.Result != null)
            {
                var summary = JsonSerializer.Deserialize<KeyPoint>(result.GetValueOrDefault().Result?.ToString()!);
                if (summary != null)
                {
                    summaries.Add(summary);
                }
            }
        }

        // Generate final page
        var generateRun = await client.CreateRunAsync(new CreateRunInput
        {
            InitialPrompt = $@"
                <data>
                    {JsonSerializer.Serialize(summaries)}
                </data>

                You are given a list of posts from Hacker News, and a summary of the comments for each post.

                Generate a web page with the following structure:
                - A header with the title of the page
                - A list of posts, with the title, a link to the post, and the key points from the comments in a ul
                - A footer with a link to the original Hacker News page",
            ResultSchema = JsonSchema.FromType<GeneratePageResult>()
        });

        var generateResult = await generateRun.PollAsync(null);
        var pageResult = JsonSerializer.Deserialize<GeneratePageResult>(generateResult.GetValueOrDefault().Result?.ToString()!);

        Console.WriteLine($"Generated page: {JsonSerializer.Serialize(pageResult)}");
    }
}
