# Sqlite MCP Server Demo

This is a demonstration of using [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) and [MCP Server SQlite](https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite) to interact with SQLite databases.

```mermaid
flowchart LR

in(In)
out(Out)
agent(Agent)
sqlite(SQLite MCP Server)
read_query(Read Query)
write_query(Write Query)
create_table(Create Table)
list_tables(List Tables)
describe_table(Describe Table)

subgraph SQLite MCP Server
  sqlite <--> read_query
  sqlite <--> write_query
  sqlite <--> create_table
  sqlite <--> list_tables
  sqlite <--> describe_table
end

in --> agent <--> sqlite
agent --> out

classDef inputOutput fill:#f9f0ed,stroke:#debbae,stroke-width:2px,color:#b35b39,font-weight:bolder;
classDef processing fill:#F0F4EB,stroke:#C2D7A7,stroke-width:2px,color:#6B8F3C,font-weight:bolder;

class in inputOutput
class out inputOutput
class agent processing
class sqlite processing
class read_query processing
class write_query processing
class create_table processing
class list_tables processing
class describe_table processing
```

Following is a sequence diagram of the workflow to interact with an SQLite database:

```mermaid
sequenceDiagram
participant User
participant AI as AI Agent
participant S as SQLite MCP Server
participant R as Read Query

User ->> AI: How many products?
AI ->> S: read_query("SELECT COUNT(*) FROM products")
S ->> R: execute("SELECT COUNT(*) FROM products")
R ->> S: 10
S ->> AI: 10
AI ->> User: There are 10 products in the database.
```

## Prerequisites

- [Node.js](https://nodejs.org) and npm installed on your machine
- An [OpenAI API key](https://platform.openai.com/api-keys) for interacting with OpenAI's services
- [uv](https://github.com/astral-sh/uv) python environment for running [MCP Server SQlite](https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite)
- Optional dependencies (if running the example from source code):
  - [Bun](https://bun.sh) for running unit tests & examples
  - [Pnpm](https://pnpm.io) for package management

## Quick Start (No Installation Required)

```bash
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY # Set your OpenAI API key

npx -y @aigne/example-mcp-sqlite # Run the example
```

## Installation

### Clone the Repository

```bash
git clone https://github.com/AIGNE-io/aigne-framework
```

### Install Dependencies

```bash
cd aigne-framework/examples/mcp-sqlite

pnpm install
```

### Setup Environment Variables

Setup your OpenAI API key in the `.env.local` file:

```bash
OPENAI_API_KEY="" # Set your OpenAI API key here
```

### Run the Example

```bash
pnpm start
```

## Example

The following example demonstrates how to interact with an SQLite database:

```typescript
import assert from "node:assert";
import { join } from "node:path";
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;
assert(OPENAI_API_KEY, "Please set the OPENAI_API_KEY environment variable");

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

const sqlite = await MCPAgent.from({
  command: "uvx",
  args: ["-q", "mcp-server-sqlite", "--db-path", join(process.cwd(), "usages.db")],
});

const aigne = new AIGNE({
  model,
  tools: [sqlite],
});

const agent = AIAgent.from({
  instructions: "You are a database administrator",
});

console.log(
  await aigne.call(agent, "create a product table with columns name description and createdAt"),
);
// output:
// {
//   $message: "The product table has been created successfully with the columns: `name`, `description`, and `createdAt`.",
// }

console.log(await aigne.call(agent, "create 10 products for test"));
// output:
// {
//   $message: "I have successfully created 10 test products in the database. Here are the products that were added:\n\n1. Product 1: $10.99 - Description for Product 1\n2. Product 2: $15.99 - Description for Product 2\n3. Product 3: $20.99 - Description for Product 3\n4. Product 4: $25.99 - Description for Product 4\n5. Product 5: $30.99 - Description for Product 5\n6. Product 6: $35.99 - Description for Product 6\n7. Product 7: $40.99 - Description for Product 7\n8. Product 8: $45.99 - Description for Product 8\n9. Product 9: $50.99 - Description for Product 9\n10. Product 10: $55.99 - Description for Product 10\n\nIf you need any further assistance or operations, feel free to ask!",
// }

console.log(await aigne.call(agent, "how many products?"));
// output:
// {
//   $message: "There are 10 products in the database.",
// }

await aigne.shutdown();
```

## License

This project is licensed under the MIT License.
