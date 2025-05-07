export function getJsonOutputPrompt(schema: Record<string, unknown> | string) {
  let prompt = "Output must be a JSON object containing the following fields only.";
  if (typeof schema === "string") {
    prompt += `\n<json_fields>\n${schema}\n</json_fields>`;
  } else {
    prompt += `\n<json_fields>\n${JSON.stringify(schema)}\n</json_fields>`;
  }
  prompt +=
    "\nDo not include any explanations, comments, or Markdown formatting (such as triple backticks). Return only the raw JSON.";
  return prompt;
}
