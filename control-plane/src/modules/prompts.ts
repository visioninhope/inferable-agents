import striptags from "striptags";

// Example:
// <p>Use Show Ticket to get context about the ticket. Take one or more of these actions. </p>
// <p>If you can't take an action, do nothing. If instead it's for an event / newsletter etc, add a tag called "spam". And
//   add an <span class="mention" data-type="mention" data-id="zendesk.notify">@zendesk.notify</span> that "Inferable has
//   identified this to be spam". </p>
// <p>If the ticket is about a refund, route it to <span class="mention" data-type="mention"
//     data-id="InferableApplications.01J6421DW95PEWX61RAK0YHJHP">@InferableApplications.01J6421DW95PEWX61RAK0YHJHP</span>
// </p>
// <p>Ff the ticket is about a request for an invoice, route it to <span class="mention" data-type="mention"
//     data-id="InferableApplications.01J6421DW95PEWX61RAK0YHJHP">@InferableApplications.01J6421DW95PEWX61RAK0YHJHP</span>
// </p>
// <p>If the ticket is about a surcharge, rout it to the application Set up Surcharge. <span class="mention"
//     data-type="mention"
//     data-id="InferableApplications.01J6421CR9R8M7J3GYYFZD94YV">@InferableApplications.01J6421CR9R8M7J3GYYFZD94YV</span>
// </p>

export const toModelInput = (str: string) => {
  // Remove all HTML tags
  const strippedHtml = striptags(str, ["tool", "data"]);

  // Replace @service.function pattern with <tool> tags
  const withToolTags = strippedHtml.replace(
    /@(\w+\.\w+)/g,
    (match, serviceFunction) => `<tool>${serviceFunction}</tool>`,
  );

  // Trim whitespace at the start and end of each line and remove empty lines
  const trimmedLines = withToolTags
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");

  // Return the result
  return trimmedLines;
};
