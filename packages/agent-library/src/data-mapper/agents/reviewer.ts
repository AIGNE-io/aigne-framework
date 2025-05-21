import { FunctionAgent, UserOutputTopic } from "@aigne/core";
import { z } from "zod";
import { applyJsonataWithValidation } from "../tools.js";

const reviewer = FunctionAgent.from({
  name: "check_mapping",
  description: "Check the mapping result",
  subscribeTopic: ["review_request"],
  publishTopic: (output) => (output.success ? UserOutputTopic : "mapping_request"),
  inputSchema: z.object({
    sourceData: z.string(),
    jsonata: z.string(),
    responseSchema: z.string(),
  }),
  process: async ({
    sourceData,
    jsonata,
    responseSchema,
  }: {
    sourceData: string;
    jsonata: string;
    responseSchema: string;
  }) => {
    let parsedSourceData = null;
    let parsedResponseSchema = null;
    try {
      parsedSourceData = sourceData ? JSON.parse(sourceData) : null;
      parsedResponseSchema = responseSchema ? JSON.parse(responseSchema) : null;
    } catch (parseError) {
      // input data is not valid JSON, return success
      return {
        success: true,
        data: null,
        feedback: `JSON parsing failed: ${parseError.message}`,
      };
    }
    const transformation = await applyJsonataWithValidation(
      parsedSourceData,
      jsonata,
      parsedResponseSchema,
    );

    // if transformation is successful, return success
    if (transformation.success) {
      return {
        success: true,
        data: transformation.data,
      };
    }

    return {
      success: transformation.success,
      data: transformation.data,
      feedback: transformation.error,
    };
  },
  includeInputInOutput: true,
});

export default reviewer;
