import { toModelInput } from "./prompts";

describe("toModelInput", () => {
  it("should strip HTML tags and replace span mentions with tool tags", () => {
    const input = `
      <p>Use Show Ticket to get context about the ticket. Take one or more of these actions. </p>
      <p>If you can't take an action, do nothing. If instead it's for an event / newsletter etc, add a tag called "spam". And
        add an <span class="mention" data-type="mention" data-id="zendesk.notify">@zendesk.notify</span> that "Inferable has
        identified this to be spam". </p>
      <p>If the ticket is about a refund, route it to <span class="mention" data-type="mention"
          data-id="InferableApplications.01J6421DW95PEWX61RAK0YHJHP">@InferableApplications.01J6421DW95PEWX61RAK0YHJHP</span>
      </p>
      <p>Ff the ticket is about a request for an invoice, route it to <span class="mention" data-type="mention"
          data-id="InferableApplications.01J6421DW95PEWX61RAK0YHJHP">@InferableApplications.01J6421DW95PEWX61RAK0YHJHP</span>
      </p>
      <p>If the ticket is about a surcharge, rout it to the application Set up Surcharge. <span class="mention"
          data-type="mention"
          data-id="InferableApplications.01J6421CR9R8M7J3GYYFZD94YV">@InferableApplications.01J6421CR9R8M7J3GYYFZD94YV</span>
      </p>
    `;

    const expectedOutput = `Use Show Ticket to get context about the ticket. Take one or more of these actions.
If you can't take an action, do nothing. If instead it's for an event / newsletter etc, add a tag called "spam". And
add an <tool>zendesk.notify</tool> that "Inferable has
identified this to be spam".
If the ticket is about a refund, route it to <tool>InferableApplications.01J6421DW95PEWX61RAK0YHJHP</tool>
Ff the ticket is about a request for an invoice, route it to <tool>InferableApplications.01J6421DW95PEWX61RAK0YHJHP</tool>
If the ticket is about a surcharge, rout it to the application Set up Surcharge. <tool>InferableApplications.01J6421CR9R8M7J3GYYFZD94YV</tool>`;

    const result = toModelInput(input);
    expect(result).toBe(expectedOutput);
  });

  it("should handle input without any HTML tags or mentions", () => {
    const input = "This is a plain text input without any HTML or mentions.";
    const result = toModelInput(input);
    expect(result).toBe(input);
  });

  it("should handle input with only HTML tags and no mentions", () => {
    const input =
      "<p>This is a <strong>formatted</strong> text with <em>no mentions</em>.</p>";
    const expectedOutput = "This is a formatted text with no mentions.";
    const result = toModelInput(input);
    expect(result).toBe(expectedOutput);
  });

  it("should handle input with only mentions and no other HTML", () => {
    const input =
      'Notify <span class="mention" data-type="mention" data-id="user.123">@John Doe</span> about this issue.';
    const expectedOutput = "Notify @John Doe about this issue.";
    const result = toModelInput(input);
    expect(result).toBe(expectedOutput);
  });
});
