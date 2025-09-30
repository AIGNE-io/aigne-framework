# Team Agent

The `TeamAgent` is a powerful component that orchestrates multiple agents to collaborate on complex tasks. It acts as a manager, directing a team of specialized agents (its `skills`) to work together. This allows you to build sophisticated workflows by combining the capabilities of different agents.

Agents within a team can work together in two primary ways:
- **Sequentially**: Like an assembly line, where the output of one agent becomes the input for the next.
- **In Parallel**: Like a brainstorming session, where all agents work on the same input simultaneously and their results are combined.

`TeamAgent` also supports advanced patterns like iterative refinement through a review process (`Reflection Mode`) and batch processing of data (`Iteration Mode`).

## Processing Modes

The `mode` option determines how the agents in the team execute their tasks.

### Sequential Mode

In `sequential` mode, agents are executed one after another in the order they are provided. The output from each agent is merged and passed as input to the subsequent agent. This is ideal for creating multi-step pipelines.

For example, you could have one agent translate a text and a second agent format the translation.

```javascript Creating a Sequential Team icon=logos:javascript
// Create individual specialized agents
const translatorAgent = FunctionAgent.from({
  name: "translator",
  process: (input) => ({
    translation: `${input.text} (translation)`,
  }),
});

const formatterAgent = FunctionAgent.from({
  name: "formatter",
  process: (input) => ({
    formatted: `[formatted] ${input.translation || input.text}`,
  }),
});

// Create a sequential TeamAgent with the specialized agents
const teamAgent = TeamAgent.from({
  name: "sequential-team",
  mode: ProcessMode.sequential,
  skills: [translatorAgent, formatterAgent],
});

const result = await teamAgent.invoke({ text: "Hello world" });

console.log(result);
// Expected output: {
//   formatted: "[formatted] Hello world (translation)"
// }
```

### Parallel Mode

In `parallel` mode, all agents in the team execute simultaneously with the same initial input. Their individual outputs are then merged into a single result. This is useful when you need to perform multiple independent tasks at once, such as querying different search engines.

```javascript Creating a Parallel Team icon=logos:javascript
const googleSearch = FunctionAgent.from({
  name: "google-search",
  process: (input) => ({
    googleResults: `Google search results for ${input.query}`,
  }),
});

const braveSearch = FunctionAgent.from({
  name: "brave-search",
  process: (input) => ({
    braveResults: `Brave search results for ${input.query}`,
  }),
});

const teamAgent = TeamAgent.from({
  name: "parallel-team",
  mode: ProcessMode.parallel,
  skills: [googleSearch, braveSearch],
});

const result = await teamAgent.invoke({ query: "AI news" });

console.log(result);
// Expected output: {
//   googleResults: "Google search results for AI news",
//   braveResults: "Brave search results for AI news"
// }
```

## Reflection: Self-Correcting Workflows

Reflection mode enables a powerful, iterative workflow where the team's output is reviewed and refined. It creates a cycle of "do, review, and improve" until the result meets a specified quality standard.

Here's how it works:
1.  The team of agents processes an input and produces an initial result.
2.  A designated `reviewer` agent evaluates this result.
3.  If the reviewer does not approve the result, it provides feedback.
4.  The team runs again, using the original input plus the feedback to create an improved result.
5.  This process repeats until the reviewer approves the output or a maximum number of iterations (`maxIterations`) is reached.

This is perfect for tasks that require high-quality output, such as writing articles, generating code, or performing detailed analysis.

## Iteration: Batch Processing

`TeamAgent` can efficiently process an array of items using a consistent workflow. By specifying the `iterateOn` option, you tell the agent which input field contains the list of items to process. The team's workflow will then be executed for each item in the array.

This is extremely useful for batch processing tasks, like summarizing a list of articles or enriching a dataset.

## Configuration

Here are the key options for configuring a `TeamAgent`:

<x-field-group>
  <x-field data-name="skills" data-type="Agent[]" data-required="true" data-desc="An array of agent instances that form the team."></x-field>
  <x-field data-name="mode" data-type="ProcessMode" data-default="sequential" data-required="false">
    <x-field-desc markdown>The processing mode. Can be `ProcessMode.sequential` for step-by-step execution or `ProcessMode.parallel` for simultaneous execution.</x-field-desc>
  </x-field>
  <x-field data-name="reflection" data-type="object" data-required="false" data-desc="Configuration for the iterative review and refinement process.">
    <x-field data-name="reviewer" data-type="Agent" data-required="true" data-desc="The agent responsible for reviewing the team's output."></x-field>
    <x-field data-name="isApproved" data-type="function | string" data-required="true">
      <x-field-desc markdown>A function or a field name to determine if the reviewer's output is approved. If a string, it checks for a truthy value in the specified field of the reviewer's output.</x-field-desc>
    </x-field>
    <x-field data-name="maxIterations" data-type="number" data-default="3" data-required="false" data-desc="The maximum number of refinement cycles before stopping."></x-field>
    <x-field data-name="returnLastOnMaxIterations" data-type="boolean" data-default="false" data-required="false">
      <x-field-desc markdown>If `true`, returns the last generated output when `maxIterations` is reached, even if not approved. Otherwise, it throws an error.</x-field-desc>
    </x-field>
  </x-field>
  <x-field data-name="iterateOn" data-type="string" data-required="false">
    <x-field-desc markdown>The key of an input field containing an array. The team will process each item in the array individually.</x-field-desc>
  </x-field>
  <x-field data-name="concurrency" data-type="number" data-default="1" data-required="false">
    <x-field-desc markdown>When using `iterateOn`, this sets the number of array items to process concurrently.</x-field-desc>
  </x-field>
  <x-field data-name="iterateWithPreviousOutput" data-type="boolean" data-default="false" data-required="false">
    <x-field-desc markdown>When using `iterateOn`, if `true`, the output from processing one item is merged and made available to the next item in the sequence. Requires `concurrency` to be 1.</x-field-desc>
  </x-field>
  <x-field data-name="includeAllStepsOutput" data-type="boolean" data-default="false" data-required="false">
    <x-field-desc markdown>In `sequential` mode, if `true`, the final output will include the results from all intermediate agents, not just the last one. Useful for debugging.</x-field-desc>
  </x-field>
</x-field-group>

## Summary

The `TeamAgent` provides a flexible and powerful way to combine multiple agents into a cohesive unit. Whether you need a simple sequential pipeline or a complex, self-correcting system, the `TeamAgent` offers the tools to build advanced AI-driven workflows.

To build your team, you'll typically use other agent types as skills. Learn more about them here:
- [AIAgent](./core-agents-ai-agent.md)
- [FunctionAgent](./core-agents-function-agent.md)