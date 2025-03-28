import { AIAgent, PromptBuilder, UserInputTopic } from "@aigne/core";
import { z } from "zod";
import { PROMPT_MAPPING } from "../prompts.js";

const mapper = AIAgent.from({
  subscribeTopic: [UserInputTopic, "mapping_request"],
  publishTopic: "review_request",
  inputSchema: z.object({
    sourceData: z.string(),
    sourceSchema: z.string().optional(),
    responseSchema: z.string(),
    instruction: z.string().optional(),
    responseData: z.string().optional(),
    feedback: z.string().optional(),
  }),
  outputSchema: z.object({
    jsonata: z.string().describe("JSONata expression"),
    confidence: z.number().describe(`Confidence score for the JSONata expression between 0 and 100.
      Give a low confidence score if there are missing fields in the source data.
      Give a low confidence score if there are multiple options for a field and it is unclear which one to choose.`),
    confidenceReasoning: z.string().describe("Reasoning for the confidence score"),
  }),
  includeInputInOutput: true,
  instructions: PromptBuilder.from({
    messages: [
      {
        role: "assistant",
        content: {
          type: "text",
          text: PROMPT_MAPPING,
        },
      },
      {
        role: "user",
        content: {
          type: "text",
          text: `Given a source data and structure, create a jsonata expression in JSON FORMAT.
                Important: The output should be a jsonata expression creating an object that matches the following schema:
                {{responseSchema}}

                Pay special attention to the requirements in field descriptions

                The instruction from the user is: {{instruction}}

                ------

                Source Data Structure:
                {{sourceSchema}}

                Source data Sample:
                {{sourceData}}

                ------

                Previous feedback:
                {{feedback}}`,
        },
      },
    ],
  }),
});
export default mapper;
