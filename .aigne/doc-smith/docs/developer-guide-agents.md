# TeamAgent

TeamAgent coordinates a group of agents working together to accomplish tasks. It manages a collection of agents (its skills) and orchestrates their execution according to a specified processing mode. This allows for the creation of complex workflows where multiple agents collaborate.

TeamAgent is particularly useful for:
- Creating agent workflows where the output from one agent feeds into another.
- Executing multiple agents simultaneously and combining their results.
- Building complex agent systems with specialized components working together.
- Implementing iterative, self-correcting workflows using reflection.
- Batch processing data items through a defined agent pipeline.

## How it Works

The `TeamAgent` processes an input by routing it through its member agents (skills) based on a defined `ProcessMode`. It can operate sequentially, in parallel, or use an iterative reflection process to refine results. The diagram below illustrates the high-level processing logic.

```d2
direction: down

Input: { shape: oval }

Mode-Selection: {
  label: "Process Mode?"
  shape: diamond
}

Sequential-Execution: {
  label: "Sequential Execution"
  Agent-1: "Agent 1"
  Agent-2: "Agent 2"
  Agent-N: "..."
  Agent-1 -> Agent-2 -> Agent-N
}

Parallel-Execution: {
  label: "Parallel Execution"
  p-agent-1: "Agent 1"
  p-agent-2: "Agent 2"
  p-agent-n: "..."
}

Combine-Results: "Combine Results"

Reflection-Check: {
  label: "Reflection?"
  shape: diamond
}

Reviewer: {
  label: "Reviewer Agent"
}

Approval-Check: {
  label: "Approved?"
  shape: diamond
}

Output: { shape: oval }

Input -> Mode-Selection

Mode-Selection -> Sequential-Execution: "sequential"
Mode-Selection -> Parallel-Execution: "parallel"

Sequential-Execution.Agent-N -> Reflection-Check
Parallel-Execution -> Combine-Results
Combine-Results -> Reflection-Check

Reflection-Check -> Output: "No"
Reflection-Check -> Reviewer: "Yes"

Reviewer -> Approval-Check
Approval-Check -> Output: "Yes"
Approval-Check -> Mode-Selection: "No (Feedback & Retry)" {
  style.stroke-dash: 2
}
```

## Key Concepts

### Processing Modes

The `mode` property in `TeamAgentOptions` determines how the agents in the team are executed.

- **`ProcessMode.sequential`**: Agents are processed one by one in the order they are provided. The output of each agent is merged and passed as input to the next agent in the sequence. This is useful for creating multi-step pipelines.
- **`ProcessMode.parallel`**: All agents are processed simultaneously, each receiving the same initial input. The final output is a combination of the results from all agents. This is ideal for tasks that can be divided into independent sub-tasks.

### Reflection Mode

Reflection mode enables an iterative refinement and validation workflow. When configured, the team's output is passed to a `reviewer` agent. The reviewer assesses the output against a specific condition (`isApproved`). If the output is not approved, the process repeats, feeding the previous output and the reviewer's feedback back into the team for another iteration. This loop continues until the output is approved or a `maxIterations` limit is reached.

This is powerful for tasks requiring quality control, self-correction, or iterative improvement.

### Iterative Processing (`iterateOn`)

The `iterateOn` option allows the `TeamAgent` to process arrays of items in a batch-like manner. You specify an input key that contains an array, and the team will execute its workflow for each item in that array. This is highly efficient for batch processing scenarios where the same set of operations needs to be applied to multiple data entries. You can control the level of parallelism using the `concurrency` option.

## Creating a TeamAgent

You can create a `TeamAgent` using the `TeamAgent.from()` static method, providing it with a set of skills (other agents) and configuration options.

### Sequential Mode Example

In this example, a `translator` agent's output is fed directly into a `sentiment` agent.

```typescript
import { AIAgent, TeamAgent, ProcessMode } from "@aigne/core";

// Agent to translate text to English
const translator = new AIAgent({
  name: "Translator",
  model,
  instructions: "Translate the following text to English.",
  inputKey: "text",
  outputKey: "translated_text",
});

// Agent to analyze the sentiment of a text
const sentiment = new AIAgent({
  name: "SentimentAnalyzer",
  model,
  instructions: "Analyze the sentiment of the following text. Is it positive, negative, or neutral?",
  inputKey: "translated_text",
  outputKey: "sentiment",
});

// A sequential team where translation happens before sentiment analysis
const sequentialTeam = TeamAgent.from({
  name: "SequentialTranslatorTeam",

  // The agents (skills) will run in this order
  skills: [translator, sentiment],
  
  // Set the mode to sequential
  mode: ProcessMode.sequential, 
});

const result = await sequentialTeam.invoke({
  text: "Me encanta este producto, es fantástico.",
});

console.log(result);
// Expected output:
// {
//   translated_text: "I love this product, it's fantastic.",
//   sentiment: "positive" 
// }
```

### Parallel Mode Example

Here, two independent agents run at the same time to gather different pieces of information from the same input text.

```typescript
import { AIAgent, TeamAgent, ProcessMode } from "@aigne/core";

// Agent to extract the main topic
const topicExtractor = new AIAgent({
  name: "TopicExtractor",
  model,
  instructions: "Identify the main topic of the text.",
  inputKey: "text",
  outputKey: "topic",
});

// Agent to summarize the text
const summarizer = new AIAgent({
  name: "Summarizer",
  model,
  instructions: "Provide a one-sentence summary of the text.",
  inputKey: "text",
  outputKey: "summary",
});

// A parallel team where both agents run simultaneously
const parallelTeam = TeamAgent.from({
  name: "ParallelAnalysisTeam",
  skills: [topicExtractor, summarizer],
  mode: ProcessMode.parallel, // Set the mode to parallel
});

const result = await parallelTeam.invoke({
  text: "The new AI model shows remarkable improvements in natural language understanding and can be applied to various industries, from healthcare to finance.",
});

console.log(result);
// Expected output:
// {
//   topic: "AI Model Improvements",
//   summary: "A new AI model has significantly advanced in natural language understanding, with broad industry applications."
// }
```

### Reflection Mode Example

This example shows a `writer` agent that generates content and a `reviewer` agent that checks if the content meets a specific word count. The team will re-run until the condition is met.

```typescript
import { AIAgent, TeamAgent, FunctionAgent } from "@aigne/core";
import { z } from "zod";

const writer = new AIAgent({
  name: "Writer",
  model,
  instructions: "Write a short paragraph about the benefits of teamwork. If you receive feedback, use it to revise the text.",
  inputKey: "request",
  outputKey: "paragraph",
});

const reviewer = new FunctionAgent({
  name: "Reviewer",
  inputSchema: z.object({ paragraph: z.string() }),
  outputSchema: z.object({
    approved: z.boolean(),
    feedback: z.string().optional(),
  }),
  process: ({ paragraph }) => {
    if (paragraph.split(" ").length >= 50) {
      return { approved: true };
    } else {
      return {
        approved: false,
        feedback: "The paragraph is too short. Please expand it to at least 50 words.",
      };
    }
  },
});

const reflectionTeam = TeamAgent.from({
  name: "ReflectiveWriterTeam",
  skills: [writer],
  reflection: {
    reviewer: reviewer,
    isApproved: "approved", // Check the 'approved' field in the reviewer's output
    maxIterations: 3,
  },
});

const result = await reflectionTeam.invoke({
  request: "Write about teamwork.",
});

console.log(result);
// The output will be a paragraph about teamwork that is at least 50 words long.
```

## Configuration Options (`TeamAgentOptions`)

The `TeamAgent` can be configured with the following options:

<x-field-group>
  <x-field data-name="mode" data-type="ProcessMode" data-required="false" data-desc="The processing mode for the agents. Can be `ProcessMode.sequential` or `ProcessMode.parallel`. Defaults to `sequential`."></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="true" data-desc="An array of agent instances that form the team."></x-field>
  <x-field data-name="reflection" data-type="ReflectionMode" data-required="false" data-desc="Configuration for reflection mode, enabling iterative review and refinement.">
    <x-field data-name="reviewer" data-type="Agent" data-required="true" data-desc="The agent responsible for reviewing the team's output."></x-field>
    <x-field data-name="isApproved" data-type="string | (output: Message) => boolean" data-required="true" data-desc="A function or the name of a boolean field in the reviewer's output that determines if the result is approved."></x-field>
    <x-field data-name="maxIterations" data-type="number" data-default="3" data-required="false" data-desc="The maximum number of review-refine iterations before stopping."></x-field>
    <x-field data-name="returnLastOnMaxIterations" data-type="boolean" data-default="false" data-required="false" data-desc="If true, returns the last output when max iterations are reached, even if not approved. Otherwise, throws an error."></x-field>
  </x-field>
  <x-field data-name="iterateOn" data-type="string" data-required="false" data-desc="The key of an input field containing an array. The team will execute its workflow for each item in the array."></x-field>
  <x-field data-name="concurrency" data-type="number" data-default="1" data-required="false" data-desc="The maximum number of concurrent operations when using `iterateOn`."></x-field>
  <x-field data-name="iterateWithPreviousOutput" data-type="boolean" data-default="false" data-required="false" data-desc="If true, the output from an iteration is merged back into the item, making it available for subsequent iterations. Only works when `concurrency` is 1."></x-field>
  <x-field data-name="includeAllStepsOutput" data-type="boolean" data-default="false" data-required="false" data-desc="In sequential mode, if true, the output stream will include chunks from all intermediate steps, not just the final one."></x-field>
</x-field-group>