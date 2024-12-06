import { Inferable } from "./inferable";
import { z } from "zod";
import assert from "assert";
import { TEST_ENDPOINT } from "./tests/utils";
import { TEST_API_SECRET } from "./tests/utils";

describe("assertions", () => {
  it("should be able to assert a run", async () => {
    const client = new Inferable({
      apiSecret: TEST_API_SECRET,
      endpoint: TEST_ENDPOINT,
    });

    client.default.register({
      name: "fetch",
      func: async ({ url }: { url: string }) => {
        if (url === "https://news.ycombinator.com/show") {
          return `<div class="container">
        <h1>Top Posts</h1>
        <ul class="post-list">
            <li class="post-item">
                <div><a href="https://news.ycombinator.com/item?id=42331270" class="post-title">Banan-OS, an Unix-like operating system written from scratch</a></div>
                <div class="post-id">ID: 42331270</div>
            </li>
            <li class="post-item">
                <div><a href="https://news.ycombinator.com/item?id=42329071" class="post-title">Replace "hub" by "ingest" in GitHub URLs for a prompt-friendly extract</a></div>
                <div class="post-id">ID: 42329071</div>
            </li>
            <li class="post-item">
                <div><a href="https://news.ycombinator.com/item?id=42333823" class="post-title">Data Connector – Chat with Your Database and APIs</a></div>
                <div class="post-id">ID: 42333823</div>
            </li>
            <li class="post-item">
                <div><a href="https://news.ycombinator.com/item?id=42332760" class="post-title">Checkmate, a server and infrastructure monitoring application</a></div>
                <div class="post-id">ID: 42332760</div>
            </li>
            <li class="post-item">
                <div><a href="https://news.ycombinator.com/item?id=42314905" class="post-title">A 5th order motion planner with PH spline blending, written in Ada</a></div>
                <div class="post-id">ID: 42314905</div>
            </li>
            <li class="post-item">
                <div><a href="https://news.ycombinator.com/item?id=42332114" class="post-title">JavaFX app recreating the Omegle chat service experience with ChatGPT</a></div>
                <div class="post-id">ID: 42332114</div>
            </li>
            <li class="post-item">
                <div><a href="https://news.ycombinator.com/item?id=42320032" class="post-title">Outerbase Studio – Open-Source Database GUI</a></div>
                <div class="post-id">ID: 42320032</div>
            </li>
            <li class="post-item">
                <div><a href="https://news.ycombinator.com/item?id=42317393" class="post-title">I combined spaced repetition with emails so you can remember anything</a></div>
                <div class="post-id">ID: 42317393</div>
            </li>
            <li class="post-item">
                <div><a href="https://news.ycombinator.com/item?id=42302560" class="post-title">Book and change flights with one email</a></div>
                <div class="post-id">ID: 42302560</div>
            </li>
            <li class="post-item">
                <div><a href="https://news.ycombinator.com/item?id=42330611" class="post-title">dotnet CMS to build drag-and-drop sites with setup infrastructure</a></div>
                <div class="post-id">ID: 42330611</div>
            </li>
        </ul>
    </div>`;
        } else {
          const randomPastYear = Math.min(
            2024,
            Math.floor(Math.random() * 100) + 1900,
          );
          return `<div class="container">
          <h1>Comments</h1>
          <ul class="comment-list">
            <li class="comment-item">
                <div class="comment-text">This is surprising because I observe the same thing in ${randomPastYear}</div>
            </li>
          </ul>
        </div>`;
        }
      },
    });

    await client.default.start();

    const resultSchema = z.object({
      topPosts: z.array(
        z.object({
          id: z.string().describe("The ID of the post"),
          title: z.string().describe("The title of the post"),
        }),
      ),
      comments: z.array(
        z.object({
          commentsPageUrl: z.string().describe("The URL of the comments page"),
          text: z.string().describe("The text of the comment"),
        }),
      ),
    });

    const run = await client.run({
      initialPrompt:
        "Get the top comment for the top 10 posts on Show HN: https://news.ycombinator.com/show",
      resultSchema: resultSchema,
    });

    const result = await run.poll<z.infer<typeof resultSchema>>({
      assertions: [
        function assertCorrect(result) {
          const missingComments = result.topPosts.filter(
            (post) =>
              !result.comments.some((comment) =>
                comment.commentsPageUrl.includes(post.id),
              ),
          );

          const duplicateComments = result.comments.filter(
            (comment, index, self) =>
              self.findIndex((c) => c.text === comment.text) !== index,
          );

          assert(
            missingComments.length === 0,
            `Some posts were missing comments: ${missingComments.map((m) => m.id).join(", ")}`,
          );
          assert(
            duplicateComments.length === 0,
            `Detected duplicate comments: ${duplicateComments.map((d) => d.text).join(", ")}`,
          );
        },
      ],
    });

    console.log(result);
  });
});
