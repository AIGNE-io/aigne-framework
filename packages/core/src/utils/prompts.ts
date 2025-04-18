export function getJsonOutputPrompt(schema: Record<string, unknown> | string) {
  let prompt = "Provide your output as a JSON containing the following fields:";
  if (typeof schema === "string") {
    prompt += `\n<json_fields>\n${schema}\n</json_fields>`;
  } else {
    prompt += `\n<json_fields>\n${JSON.stringify(schema)}\n</json_fields>`;
  }
  return prompt;
}
