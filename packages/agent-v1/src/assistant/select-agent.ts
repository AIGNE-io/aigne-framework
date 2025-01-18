import { isChatCompletionChunk } from "@blocklet/ai-kit/api/types/chat";

import type { RouterAssistant } from "../types";
import retry from "../utils/retry";
import type { CallAI } from "./type";

const selectAgentSystemPrompt = () => `\
### Job Description
You are a text classification engine that analyzes text data and assigns categories based on user input or automatically determined categories.


### Task
Your task is to assign one categories ONLY to the input text and only one category may be assigned returned in the output.
Additionally, you need to extract the key words from the text that are related to the classification.


### Format
- "input_text" is in the variable text_field.
- "categories" are specified as a category list in the variable categories or left empty for automatic determination.
- "classification_instructions" may be included to improve the classification accuracy.


### Constraint
- DO NOT include anything other than the JSON array in your response.
- The output results must be within the scope of categories, not content outside the scope
`;

async function generateSelectAgentName({
  assistant,
  message,
  callAI,
  maxRetries = 0,
  categories,
}: {
  assistant: RouterAssistant & { project: { id: string } };
  message: string;
  callAI: CallAI;
  maxRetries?: number;
  categories: string;
}) {
  return retry(async () => {
    const selectAgentIdResponseByPrompt = await callAI({
      assistant,
      input: {
        messages: [
          {
            role: "system",
            content: `${selectAgentSystemPrompt()}`,
          },
          {
            role: "user",
            content:
              '\n { "input_text": ["I recently had a great experience with your company. The service was prompt and the staff was very friendly."],\n "categories": [{,"category_name": "Customer Service"}, {"category_name": "Satisfaction"}, {"category_name": "Sales"}, {"category_name": "Product"}],\n "classification_instructions": []}\n',
          },
          {
            role: "assistant",
            content: '{"category_name": "Customer Service"}',
          },
          {
            role: "user",
            content:
              '\n {"input_text": ["bad service, slow to bring the food"],\n "categories": [{"category_name": "Food Quality"}, {"category_name": "Experience"}, {"category_name": "Price"}],\n "classification_instructions": []}\n',
          },
          {
            role: "assistant",
            content: '{"category_name": "Experience"}',
          },
          {
            role: "user",
            content: `\n {"input_text": [${message}],\n "categories": [${categories}],\n "classification_instructions": []}\n`,
          },
        ],
        model: assistant?.model,
        temperature: assistant?.temperature,
        topP: assistant?.topP,
        presencePenalty: assistant?.presencePenalty,
        frequencyPenalty: assistant?.frequencyPenalty,
      },
    });

    let text = "";
    for await (const chunk of selectAgentIdResponseByPrompt) {
      if (isChatCompletionChunk(chunk) && chunk.delta.content) {
        text += chunk.delta.content;
      }
    }

    const json = JSON.parse(text);
    return json;
  }, maxRetries);
}

export default generateSelectAgentName;
