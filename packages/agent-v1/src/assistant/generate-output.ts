import {
  type ChatCompletionResponse,
  isChatCompletionChunk,
} from "@blocklet/ai-kit/api/types/chat";

import type { Assistant, Role, Variable } from "../types";
import {
  outputVariablesToJoiSchema,
  outputVariablesToJsonSchema,
} from "../types/runtime/schema";
import { ExtractMetadataTransform } from "../utils/extract-metadata-transform";
import retry from "../utils/retry";
import type { CallAI } from "./type";

export const metadataPrefix = "```metadata";
export const metadataSuffix = "```";

export const metadataOutputFormatPrompt = (schema: string) => `\
## Metadata Schema
Here is the metadata json schema, inside the <metadata-schema></metadata-schema> XML tags:
<metadata-schema>
${schema}
</metadata-schema>

## Output Rules
- You have to generate a json metadata base on the metadata schema above, inside the <metadata-schema></metadata-schema> XML tags
- Don't make any explanation

## Output Format
[Generate a json data based on the above metadata schema, put the json string into the following code block]
${metadataPrefix}
${metadataSuffix}

## Output Example
${metadataPrefix}
{"key": "value"}
${metadataSuffix}
`;

export const metadataStreamOutputFormatPrompt = (schema: string) => `\
## Metadata Schema
Here is the metadata json schema, inside the <metadata-schema></metadata-schema> XML tags:
<metadata-schema>
${schema}
</metadata-schema>

## Output Rules
- You have to generate a text content and a json metadata base on the metadata schema above, inside the <metadata-schema></metadata-schema> XML tags
- Don't make any explanation

## Output Format
[Your text content here]
[Generate a json data based on the above metadata schema, put the json string into the following code block]
${metadataPrefix}
${metadataSuffix}

## Output Example
[Here is your answer to the the user's question]
${metadataPrefix}
{"key": "value"}
${metadataSuffix}
`;

export async function generateOutput({
  assistant,
  messages,
  callAI,
  maxRetries = 0,
  datastoreVariables,
}: {
  assistant: Assistant & { project: { id: string } };
  messages: { role: Role; content: string }[];
  callAI: CallAI;
  maxRetries?: number;
  datastoreVariables: Variable[];
}) {
  const jsonSchema = outputVariablesToJsonSchema(assistant, {
    variables: datastoreVariables,
  });
  const joiSchema = outputVariablesToJoiSchema(assistant, {
    variables: datastoreVariables,
  });

  const outputSchema = JSON.stringify(jsonSchema, null, 2);

  messages.push({
    role: "system",
    content: metadataOutputFormatPrompt(outputSchema),
  });

  return retry(async () => {
    const result = await callAI({
      assistant,
      input: {
        stream: true,
        messages,
      },
    });

    let text = "";

    for await (const chunk of extractMetadataFromStream(result, true)) {
      if (chunk.type === "match") text += chunk.text;
    }

    const json = JSON.parse(text);

    return await joiSchema.validateAsync(json);
  }, maxRetries);
}

export function extractMetadataFromStream(
  input: ReadableStream<ChatCompletionResponse>,
  extract = true,
) {
  return input
    .pipeThrough(
      new TransformStream({
        transform: (chunk, controller) => {
          if (isChatCompletionChunk(chunk))
            if (chunk.delta.content) controller.enqueue(chunk.delta.content);
        },
      }),
    )
    .pipeThrough(
      new ExtractMetadataTransform({
        // Pass empty string to disable extractor
        start: extract ? metadataPrefix : "",
        end: extract ? metadataSuffix : "",
      }),
    );
}
