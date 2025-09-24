# AI Agent

The `AIAgent` is the foundational building block in the AIGNE framework. Think of it as your primary worker, designed to communicate with Large Language Models (LLMs) to understand tasks, process information, and generate intelligent responses.

Its main job is to take a set of `instructions` you provide, interact with an AI model (like OpenAI's GPT-4), and return the result in a structured format that your application can easily use. This is perfect for tasks like summarizing text, extracting specific information, answering questions, or categorizing content.

Two key features make the `AIAgent` powerful and reliable:

1.  **Instructions, Not Prompts**: Instead of simple prompts, you give the `AIAgent` a clear set of `instructions`. This allows for more detailed and explicit task definitions, guiding the AI more effectively.
2.  **Structured Output**: You can define exactly what the output should look like using an `outputSchema`. This ensures the AI's response isn't just a block of text, but a predictable, machine-readable JSON object, which is crucial for building reliable applications.

## How It Works

The `AIAgent` follows a simple but effective process:

1.  **Initialization**: You create an `AIAgent` by giving it a connection to an AI model and a set of `instructions`.
2.  **Execution**: When you run the agent with some input, it combines your instructions and the input into a request for the AI model.
3.  **Response Generation**: The AI model processes the request and generates a response.
4.  **Output Formatting**: The `AIAgent` takes the model's raw response and formats it according to the `outputSchema` you defined, returning a clean JSON object.

## Basic Usage

Here’s a simple example of how to create and use an `AIAgent` to generate a creative story title based on a theme.

```typescript Creating an AIAgent icon=logos:typescript
import { AIAgent } from '@aigne/core';
import { OpenAI } from '@aigne/models/openai';
import { z } from 'zod';

// 1. Define the structure of the output you want
const StorySchema = z.object({
  title: z.string().describe('A creative and catchy title for the story'),
  tagline: z.string().describe('A short, intriguing tagline'),
});

// 2. Initialize the AI model you want to use
const model = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o',
});

// 3. Create the AIAgent with instructions and the output schema
const storyAgent = new AIAgent({
  model,
  instructions: 'You are a creative writer. Generate a title and tagline for a story.',
  outputSchema: StorySchema,
});

// 4. Run the agent with specific input
async function generateStoryTitle() {
  const result = await storyAgent.run({
    input: { theme: 'a robot who discovers music' },
  });

  console.log('Generated Story Title:', result.title);
  console.log('Tagline:', result.tagline);
}

generateStoryTitle();
```

### Expected Output

Running the code above would produce a structured object like this:

```json Response Example icon=mdi:code-json
{
  "title": "The Silicon Symphony",
  "tagline": "His world was logic. Until he heard the first note."
}
```

## Configuration

When you create a new `AIAgent`, you can pass a configuration object with the following properties:

<x-field-group>
  <x-field data-name="model" data-type="Model" data-required="true">
    <x-field-desc markdown>An instance of an AI model, such as `OpenAI` or `Anthropic`. This is the engine the agent will use to think.</x-field-desc>
  </x-field>
  <x-field data-name="instructions" data-type="string" data-required="true">
    <x-field-desc markdown>A clear and detailed description of the agent's task and personality. This guides the AI's behavior.</x-field-desc>
  </x-field>
  <x-field data-name="outputSchema" data-type="ZodSchema" data-required="false">
    <x-field-desc markdown>A schema from the Zod library that defines the structure of the output. This forces the AI to respond in a consistent JSON format.</x-field-desc>
  </x-field>
  <x-field data-name="name" data-type="string" data-required="false">
    <x-field-desc markdown>A unique name for the agent, used for logging and identification.</x-field-desc>
  </x-field>
  <x-field data-name="description" data-type="string" data-required="false">
    <x-field-desc markdown>A brief description of what the agent does.</x-field-desc>
  </x-field>
  <x-field data-name="system_prompts" data-type="string[]" data-required="false">
    <x-field-desc markdown>An array of system-level prompts to further guide the model's behavior, often used for setting tone or constraints.</x-field-desc>
  </x-field>
</x-field-group>

## Next Steps

Now that you understand the `AIAgent`, you might wonder how to give it tools to interact with the outside world or how to make multiple agents work together. 

<x-cards>
  <x-card data-title="Function Agent" data-icon="lucide:function-square" data-href="/core/agents/function-agent">
    Learn how to give your agents tools and capabilities by wrapping JavaScript functions.
  </x-card>
  <x-card data-title="Team Agent" data-icon="lucide:users" data-href="/core/agents/team-agent">
    Discover how to orchestrate multiple agents to collaborate on solving complex problems.
  </x-card>
</x-cards>