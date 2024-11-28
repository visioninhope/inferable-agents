export const colorizeJSON = (json: string) => {
  const colorMap: { [key: string]: string } = {
    string: "#7c7c7c",
    number: "#6b8e23",
    boolean: "#8b4513",
    null: "#778899",
    key: "#4682b4",
  };

  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let type = "number";
      if (/^"/.test(match)) {
        type = /:$/.test(match) ? "key" : "string";
      } else if (/true|false/.test(match)) {
        type = "boolean";
      } else if (/null/.test(match)) {
        type = "null";
      }
      return `<span style="color:${colorMap[type]}">${match}</span>`;
    },
  );
};
