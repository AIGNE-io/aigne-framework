import assert from "node:assert";
import { join } from "node:path";
import { AIAgent, ChatModelOpenAI, ExecutionEngine, MCPAgent } from "@aigne/core-next";

const { OPENAI_API_KEY } = process.env;
assert(OPENAI_API_KEY, "Please set the OPENAI_API_KEY environment variable");

const model = new ChatModelOpenAI({
  apiKey: OPENAI_API_KEY,
});

const sqlite = await MCPAgent.from({
  command: "uvx",
  args: ["-q", "mcp-server-sqlite", "--db-path", join(process.cwd(), "usages.db")],
});

const engine = new ExecutionEngine({
  model,
  tools: [sqlite],
});

const agent = AIAgent.from({
  instructions: "You are a database administrator",
});

console.log(
  await engine.run("create a product table with columns name description and createdAt", agent),
);
// output:
// {
//   text: "The product table has been created successfully with the columns: `name`, `description`, and `createdAt`.",
// }

console.log(await engine.run("create 10 products for test", agent));
// output:
// {
//   text: "I have successfully created 10 test products in the database. Here are the products that were added:\n\n1. Product 1: $10.99 - Description for Product 1\n2. Product 2: $15.99 - Description for Product 2\n3. Product 3: $20.99 - Description for Product 3\n4. Product 4: $25.99 - Description for Product 4\n5. Product 5: $30.99 - Description for Product 5\n6. Product 6: $35.99 - Description for Product 6\n7. Product 7: $40.99 - Description for Product 7\n8. Product 8: $45.99 - Description for Product 8\n9. Product 9: $50.99 - Description for Product 9\n10. Product 10: $55.99 - Description for Product 10\n\nIf you need any further assistance or operations, feel free to ask!",
// }

console.log(await engine.run("how many products?", agent));
// output:
// {
//   text: "There are 10 products in the database.",
// }

await engine.shutdown();
