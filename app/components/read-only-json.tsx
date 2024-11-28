import { colorizeJSON } from "@/lib/colorize-json";

export const ReadOnlyJSON = ({ json }: { json: string | object }) => {
  let formattedJson: string;

  if (typeof json === "object") {
    formattedJson = JSON.stringify(json, null, 2);
  } else if (typeof json === "string") {
    try {
      formattedJson = JSON.stringify(JSON.parse(json), null, 2);
    } catch (e) {
      formattedJson = "{}";
    }
  } else {
    formattedJson = "{}";
  }

  // Replace \n with actual line breaks
  formattedJson = formattedJson.replace(/\\n/g, "\n");

  const colorizedJson = colorizeJSON(formattedJson);

  return (
    <pre
      className="bg-gray-100 p-2 rounded-md overflow-x-auto text-xs whitespace-pre-wrap"
      dangerouslySetInnerHTML={{
        __html: colorizedJson,
      }}
    />
  );
};
