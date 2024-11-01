export async function getUrlContent({ url }: { url: string }) {
  const response = await fetch(url);

  if (!response.ok) {
    return {
      supervisor:
        "If the error is retryable, try again. If not, tell the user why this failed.",
      message: `Failed to fetch ${url}: ${response.statusText}`,
      response,
    };
  }

  const html = await response.text();

  // Simplified regex to strip HTML tags except for <a> tags
  return html.replace(/<(?!a\s|\/a\s|a>|\/a>)[^>]*>/g, "");
}

getUrlContent({ url: "https://news.ycombinator.com/" }).then((result) => {
  console.log(result);
});
