# Adding Skills to Agents

By adding skills to Agents, you can significantly expand their functional scope, enabling Agents to perform more specialized tasks. This guide will demonstrate how to add MCP Servers as skills to Agents, allowing them to access cryptocurrency market data.

## Basic Process

The process of adding skills to an Agent includes the following steps:

1. **Create or Obtain Skill Agents** - Prepare Agents with specific functionalities to serve as skill providers
2. **Configure Main Agent** - Create the main Agent and add skill Agents to the skills array
3. **Define Appropriate Instructions** - Ensure the main Agent's instructions can properly guide it to use the added skills
4. **Invoke Enhanced Agent** - Use the Agent with new skills to handle related queries

Let's understand the implementation details of each step:

### Creating MCP Agent as Skill

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-add-skills-to-agent-create-skill-agent" exclude_imports
const ccxt = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@mcpfun/mcp-server-ccxt"],
});
```

**Explanation**:

* **Skill Source**: Use `MCPAgent.from()` to create a skill Agent specifically for providing cryptocurrency data
* **Server Selection**: The `@mcpfun/mcp-server-ccxt` package provides access to cryptocurrency data from multiple global exchanges
* **Launch Method**: Start the server on-demand through npx without pre-installation
* **Instantiation Process**: This method is asynchronous, returning a fully initialized Agent instance connected to the server
* **Capability Scope**: This MCP Agent has various skills including market data queries, trading operations, and system management

### Adding Skills to Main Agent

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-add-skills-to-agent-add-skills" exclude_imports
const agent = AIAgent.from({
  instructions: "You are a helpful assistant for Crypto market cap",
  skills: [ccxt],
  inputKey: "message",
});
```

**Explanation**:

* **Skill Integration**: Add the ccxt MCP Agent as a skill to the main Agent through the `skills` array parameter
* **Configuration Structure**:
  * `skills`: Accepts an array of Agents, each element becomes an available skill
  * `instructions`: Define the Agent's role and behavioral guidelines, guiding it to use skills correctly
* **Capability Extension**: After integration, the main Agent inherits all cryptocurrency data access capabilities
* **Knowledge Separation**: The main Agent handles natural language understanding while skill Agents handle specialized functionality implementation
* **Automatic Routing**: The framework automatically decides when to route requests to skill Agents

### Invoking Agent with Skills

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-add-skills-to-agent-invoke-agent" exclude_imports
const result = await aigne.invoke(agent, {
  message: "What is the crypto price of ABT/USD on coinbase?",
});
console.log(result);
// Output: { message:"The current price of ABT/USD on Coinbase is $0.9684." }
```

**Explanation**:

* **Usage Method**: Invocation is exactly the same as with regular Agents, requiring no special handling
* **Intelligent Decision Making**:
  * Agent analyzes that the user's question involves cryptocurrency price queries
  * Automatically identifies the need to use ccxt skills to obtain price data
  * Calls appropriate skill methods to get ABT/USD price on Coinbase
* **Result Processing**: Converts technical trading data into user-friendly natural language responses
* **Seamless Experience**: Users don't need to understand the existence or invocation methods of underlying skills

## Example Code

The following example shows how to add cryptocurrency data query capabilities to an Agent:

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-add-skills-to-agent"
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

const ccxt = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@mcpfun/mcp-server-ccxt"],
});

const agent = AIAgent.from({
  instructions: "You are a helpful assistant for Crypto market cap",
  skills: [ccxt],
  inputKey: "message",
});

const result = await aigne.invoke(agent, {
  message: "What is the crypto price of ABT/USD on coinbase?",
});
console.log(result);
// Output: { message:"The current price of ABT/USD on Coinbase is $0.9684." }
```

## Tips

* **Multi-Skill Support**: You can add multiple different types of skills by including multiple skill Agents in the `skills` array
* **Skill Types**: Supports various types of skill Agents:
  * **Function Agent**: Provides programming function capabilities
  * **MCP Agent**: Provides specialized domain services
  * **AI Agent**: Provides capabilities from other AI models
* **Skill Combination**: You can combine complementary skills to create multi-functional Agents, such as adding both market data and news analysis skills simultaneously
