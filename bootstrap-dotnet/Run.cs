using System.Diagnostics;
using Inferable;
using System.Text.Json;
using Inferable.API;

public class Post
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public string Points { get; set; } = "";
    public string CommentsUrl { get; set; } = "";
}

public class KeyPoint
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public List<string> KeyPoints { get; set; } = new();
}

public class GeneratePageResult
{
    public string PagePath { get; set; } = "";
}

public static class RunHNExtraction
{
    public static async Task RunAsync(InferableClient? client = null)
    {
        // Use the provided client or create a new one if none is provided
        client ??= new InferableClient(new InferableOptions
        {
            ApiSecret = Environment.GetEnvironmentVariable("INFERABLE_API_SECRET"),
            BaseUrl = Environment.GetEnvironmentVariable("INFERABLE_API_ENDPOINT")
        });

        // Extract top posts
        var extractRun = await client.CreateRunAsync(new Inferable.API.CreateRunInput
        {
            Message = @"
                Hacker News has a homepage at https://news.ycombinator.com/
                Each post has a id, title, a link, and a score, and is voted on by users.
                Score the top 10 posts and pick the top 3 according to the internal scoring function."
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
        var summaries = new List<KeyPoint>();
        foreach (var post in posts.Posts)
        {
            var summarizeRun = await client.CreateRunAsync(new CreateRunInput
            {
                Message = $@"
                    <data>
                        {JsonSerializer.Serialize(post)}
                    </data>

                    You are given a post from Hacker News, and a url for the post's comments.
                    Summarize the comments. You should visit the comments URL to get the comments.
                    Produce a list of the key points from the comments."
            });

            var summarizeResult = await summarizeRun.PollAsync(null);
            var summary = JsonSerializer.Deserialize<KeyPoint>(summarizeResult.GetValueOrDefault().Result?.ToString()!);
            if (summary != null)
            {
                summaries.Add(summary);
            }
        }

        // Generate final page
        var generateRun = await client.CreateRunAsync(new CreateRunInput
        {
            Message = $@"
                <data>
                    {JsonSerializer.Serialize(summaries)}
                </data>

                You are given a list of posts from Hacker News, and a summary of the comments for each post.

                Generate a web page with the following structure:
                - A header with the title of the page
                - A list of posts, with the title, a link to the post, and the key points from the comments in a ul
                - A footer with a link to the original Hacker News page"
        });

        var generateResult = await generateRun.PollAsync(null);
        var pageResult = JsonSerializer.Deserialize<GeneratePageResult>(generateResult.GetValueOrDefault().Result?.ToString()!);

        Console.WriteLine($"Generated page: {JsonSerializer.Serialize(pageResult)}");

        // Open browser
        try
        {
            var clusterId = Environment.GetEnvironmentVariable("INFERABLE_CLUSTER_ID");
            var url = $"https://app.inferable.ai/clusters/{clusterId}/runs";

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

    private class ExtractResult
    {
        public List<Post> Posts { get; set; } = new();
    }
}
