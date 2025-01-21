# Example Project

This is an example project for the AIGNE Framework, demonstrating how to use different agents to handle various tasks.

## Usage

1. First, make sure you have [Bun](https://bun.sh/) installed.

2. Clone the project

   ```bash
   git clone https://github.com/AIGNE-io/aigne-framework.git
   ```

3. Install dependencies

   ```bash
   pnpm install
   ```

4. Navigate to the example project

   ```bash
   cd examples/agents
   ```

Then, you can use the following commands to run different examples:

### Run Function Agent Example

```bash
bun src/function-agent.ts
```

### Run OpenAI LLM Agent Example

```bash
bun src/openai-llm-agent.ts
```

### Run OpenAPI Agent Example

```bash
bun src/open-api-agent.ts
```

### Run LLM Decision Agent Example

```bash
bun src/llm-decision-agent.ts
```

### Run Gemini LLM Agent Example

```bash
bun src/gemini-llm-agent.ts
```

### Run Function Agent Return Streaming Text Example

```bash
bun src/function-agent-return-streaming-text.ts
```

Each example file demonstrates how to create and run different types of agents. For specific details, please refer to the corresponding TypeScript files.
