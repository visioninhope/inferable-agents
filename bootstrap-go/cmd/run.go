package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"

	inferable "github.com/inferablehq/inferable/sdk-go"
	"github.com/joho/godotenv"
)

type Post struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Points      string `json:"points"`
	CommentsURL string `json:"commentsUrl"`
}

type ExtractResult struct {
	Posts []Post `json:"posts"`
}

type KeyPoint struct {
	ID        string   `json:"id"`
	Title     string   `json:"title"`
	KeyPoints []string `json:"keyPoints"`
}

type GeneratePageResult struct {
	PagePath string `json:"pagePath"`
}

type SummarizeResult struct {
	Index   int
	Summary KeyPoint
	Error   error
}

func main() {
	if err := godotenv.Load(); err != nil {
		fmt.Printf("Warning: Error loading .env file: %v\n", err)
	}

	client, err := inferable.New(inferable.InferableOptions{
		APISecret:   os.Getenv("INFERABLE_API_SECRET"),
		APIEndpoint: os.Getenv("INFERABLE_API_ENDPOINT"),
	})
	if err != nil {
		panic(err)
	}

	fmt.Println("Opening browser to view runs")

	url := "https://app.inferable.ai/clusters"

	if os.Getenv("INFERABLE_CLUSTER_ID") != "" {
		url = fmt.Sprintf("https://app.inferable.ai/clusters/%s/runs", os.Getenv("INFERABLE_CLUSTER_ID"))
	}

	cmd := exec.Command("open", url)
	if err := cmd.Run(); err != nil {
		fmt.Printf("Failed to open browser: %v\n", err)
	}

	// 1. Extract top posts from Hacker News
	extractionSchema := map[string]interface{}{
		"type": "object",
		"properties": map[string]interface{}{
			"posts": map[string]interface{}{
				"type": "array",
				"items": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"id":          map[string]string{"type": "string"},
						"title":       map[string]string{"type": "string"},
						"points":      map[string]string{"type": "string"},
						"commentsUrl": map[string]string{"type": "string"},
					},
				},
			},
		},
	}

	extractRun, err := client.CreateRun(inferable.CreateRunInput{
		InitialPrompt: `Hacker News has a homepage at https://news.ycombinator.com/
		Each post has a id, title, a link, and a score, and is voted on by users.
		Score the top 10 posts and pick the top 3 according to the internal scoring function.`,
		CallSummarization: false,
		ResultSchema:      extractionSchema,
	})
	if err != nil {
		panic(err)
	}

	extractResult, err := extractRun.Poll(nil)
	if err != nil {
		panic(err)
	}

	var posts ExtractResult
	resultBytes, err := json.Marshal(extractResult.Result)
	if err != nil {
		panic(fmt.Sprintf("failed to marshal extract result: %v", err))
	}
	if err := json.Unmarshal(resultBytes, &posts); err != nil {
		panic(err)
	}

	// 2. Summarize comments for each post concurrently
	summarizationSchema := map[string]interface{}{
		"type": "object",
		"properties": map[string]interface{}{
			"id":        map[string]string{"type": "string"},
			"title":     map[string]string{"type": "string"},
			"keyPoints": map[string]string{"type": "array"},
		},
	}

	summaryChan := make(chan SummarizeResult, len(posts.Posts))

	for i, post := range posts.Posts {
		go func(index int, post Post) {
			summarizeRun, err := client.CreateRun(inferable.CreateRunInput{
				InitialPrompt: fmt.Sprintf(`
				<data>
					%s
				</data>

				You are given a post from Hacker News, and a url for the post's comments.
				Summarize the comments. You should visit the comments URL to get the comments.
				Produce a list of the key points from the comments.
				`, post),
				ResultSchema: summarizationSchema,
			})
			if err != nil {
				summaryChan <- SummarizeResult{Index: index, Error: err}
				return
			}

			summarizeResult, err := summarizeRun.Poll(nil)
			if err != nil {
				summaryChan <- SummarizeResult{Index: index, Error: err}
				return
			}

			var summary KeyPoint
			resultBytes, err := json.Marshal(summarizeResult.Result)
			if err != nil {
				summaryChan <- SummarizeResult{Index: index, Error: fmt.Errorf("failed to marshal summarize result: %v", err)}
				return
			}
			if err := json.Unmarshal(resultBytes, &summary); err != nil {
				summaryChan <- SummarizeResult{Index: index, Error: err}
				return
			}

			summaryChan <- SummarizeResult{Index: index, Summary: summary}
		}(i, post)
	}

	summaries := make([]KeyPoint, len(posts.Posts))
	for range posts.Posts {
		result := <-summaryChan
		if result.Error != nil {
			panic(result.Error)
		}
		summaries[result.Index] = result.Summary
	}

	// 3. Generate final HTML page with summaries
	pageGenerationSchema := map[string]interface{}{
		"type": "object",
		"properties": map[string]interface{}{
			"pagePath": map[string]string{"type": "string"},
		},
	}

	generateRun, err := client.CreateRun(inferable.CreateRunInput{
		InitialPrompt: fmt.Sprintf(`
		<data>
			%s
		</data>

		You are given a list of posts from Hacker News, and a summary of the comments for each post.

		Generate markdown with the following structure, and generate an HTML page from it.
		- A header with the title of the page
		- A list of posts, with the title, a link to the post, and the key points from the comments in a ul
		- A footer with a link to the original Hacker News page
		`, summaries),
		ResultSchema: pageGenerationSchema,
	})
	if err != nil {
		panic(err)
	}

	generateResult, err := generateRun.Poll(nil)
	if err != nil {
		panic(err)
	}

	var pageResult GeneratePageResult
	resultBytes, err = json.Marshal(generateResult.Result)
	if err != nil {
		panic(fmt.Sprintf("failed to marshal generate result: %v", err))
	}
	if err := json.Unmarshal(resultBytes, &pageResult); err != nil {
		panic(err)
	}

	fmt.Printf("Generated page: %+v\n", pageResult)
}
