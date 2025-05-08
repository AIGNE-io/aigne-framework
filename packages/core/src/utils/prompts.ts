function buildJsonPrompt(schema: Record<string, unknown> | string, firstLine: string) {
  let prompt = firstLine;
  if (typeof schema === "string") {
    prompt += `\n<json_fields>\n${schema}\n</json_fields>`;
  } else {
    prompt += `\n<json_fields>\n${JSON.stringify(schema)}\n</json_fields>`;
  }
  prompt +=
    "\nDo not include any explanations, comments, or Markdown formatting (such as triple backticks). Return only the raw JSON.";
  return prompt;
}

export function getJsonOutputPrompt(schema: Record<string, unknown> | string) {
  return buildJsonPrompt(
    schema,
    "Output must be a JSON object containing the following fields only.",
  );
}

export function getJsonToolInputPrompt(schema: Record<string, unknown> | string) {
  return buildJsonPrompt(
    schema,
    "Tool input must be a JSON object containing the following fields only.",
  );
}
