import { type Agent, AIAgent, AIGNE } from "@aigne/core";
import { z } from "zod";
import type { DatasetItem, Evaluation, Evaluator } from "./type.js";

const EVALUATOR_PROMPT = `
# Instructions
You are an expert evaluator. Your task is to evaluate the quality of AI-generated responses.
You will be given:
1. User Input (Prompt)
2. AI-generated Output
3. Expected Output

## Evaluation Methods
Follow these three correlation checks before assigning a score:
1. **AI Output vs User Input**: Check if the AI response is relevant to the user input.
2. **Expected Output vs User Input**: Check if the expected output is relevant to the user input.
3. **AI Output vs Expected Output**: Check the similarity and alignment between the AI output and the expected output.

Then assign a rating and a score based on the overall quality.

## Criteria
- **Instruction following**: Does the AI response follow the prompt’s requirements?
- **Groundedness**: Is the AI response consistent with the expected output and free from irrelevant information?
- **Completeness**: Does the AI response fully address the task?
- **Accuracy/Correctness**: Is the AI response factually correct and logically consistent?
- **Fluency**: Is the AI response clear, structured, and easy to read?

## Rating Rubric (1–5)
- **5 - Very Good**: Highly relevant, closely aligned with the expected output, accurate, complete, and fluent.
- **4 - Good**: Relevant, mostly aligned with the expected output, generally accurate and complete, only minor issues.
- **3 - Ok**: Somewhat relevant, partially aligned, or missing important details.
- **2 - Bad**: Weak relevance, low similarity with expected output, contains significant errors or omissions.
- **1 - Very Bad**: Irrelevant, fails to align with expected output, or completely incorrect.

## Evaluation Steps
1. Compare the **semantic content** of AI Output vs Expected Output.
  - Ignore JSON keys, object structure, formatting, whitespace, capitalization, and minor punctuation differences.
  - If meaning is the same but phrasing differs slightly, assign a higher score (4–5).
  - If AI output deviates significantly, assign a lower score (1–2).
  - If AI output is empty, assign a lower score (1–2).
2. Assess against criteria: instruction following, groundedness, completeness, correctness, fluency.
3. Assign a 1–5 integer score.
4. Provide reasoning, and explicitly justify why this result is **not** a 1/2/3 case (why it avoids being a negative example).

# Response Output Format
Your output must strictly follow this three-line format:
- First line: rating (Very Good, Good, Ok, Bad, Very Bad)
- Second line: reasoning (must include justification why it is not a 1, 2, or 3 if scored higher)
- Third line: SCORE: [1-5]

Example:
Good
The response follows most instructions and is largely consistent with the expected output, but it omits one detail. This prevents it from being 5. However, it is more accurate and complete than an "Ok" response, so it deserves 4.
SCORE: 4

# User Inputs and AI-generated Response
### Input
{{input}}

### AI-generated Output
{{output}}

### Expected Output
{{expectedOutput}}
`;

const defaultAgent = AIAgent.from({
  name: "LLMEvaluator",
  instructions: EVALUATOR_PROMPT,
  inputSchema: z.object({
    input: z.string().describe("The input content to analyze"),
    output: z.string().describe("The output content to analyze"),
    expectedOutput: z.string().describe("The expected output content to analyze"),
  }),
  outputSchema: z.object({
    rating: z
      .enum(["Very Good", "Good", "Ok", "Bad", "Very Bad"])
      .describe("The rating of the output"),
    reasoning: z.string().describe("The reasoning of the rating, including justification"),
    score: z.number().int().min(1).max(5).describe("The score of the output, 1–5, 5 is the best"),
  }),
});

export class LLMEvaluator implements Evaluator {
  name = "llm-as-judge";

  constructor(
    private readonly aigne: AIGNE = new AIGNE(),
    private readonly agent: Agent = defaultAgent,
  ) {}

  async evaluate(dataset: DatasetItem): Promise<Evaluation[]> {
    const result = await this.aigne.invoke(
      this.agent,
      {
        input:
          typeof dataset.input === "string"
            ? dataset.input
            : JSON.stringify(dataset.input, null, 2),
        output: dataset.output ? JSON.stringify(dataset.output, null, 2) : "",
        expectedOutput: JSON.stringify(dataset.expected, null, 2),
      },
      { returnMetadata: true },
    );

    return [
      {
        name: this.name,
        rating: result.rating,
        score: result.score,
        reason: result.reasoning,
        usage: result?.$meta?.usage ?? {},
      },
    ];
  }
}
