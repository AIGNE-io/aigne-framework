#!/usr/bin/env npx -y bun

import { AFS } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";
import { SQLiteAFS } from "@aigne/afs-sqlite";
import { loadAIGNEWithCmdOptions, runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent } from "@aigne/core";
import yargs from "yargs";
import { seedDatabase } from "./seed-data.js";

const argv = yargs()
  .option("db", {
    type: "string",
    describe: "Path to SQLite database",
    default: ":memory:",
  })
  .strict(false)
  .parseSync(process.argv);

const aigne = await loadAIGNEWithCmdOptions();

// Seed the database with Northwind data
// Use shared cache mode for in-memory database so both seed and SQLiteAFS use the same db
const dbUrl = argv.db === ":memory:" ? "file::memory:?cache=shared" : `file:${argv.db}`;
await seedDatabase(dbUrl);

const afs = new AFS()
  .mount(new AFSHistory({ storage: { url: ":memory:" } }))
  .mount(
    new SQLiteAFS({
      url: dbUrl,
      name: "northwind",
      description: "Northwind sample database - customers, orders, products, employees",
    })
  );

const agent = AIAgent.from({
  instructions: `You are a business analyst assistant with access to the Northwind database.

The Northwind database contains data for a fictional company that imports and exports specialty foods. It includes:
- **categories**: Product categories (Beverages, Seafood, etc.)
- **suppliers**: Companies that supply products
- **products**: Items for sale with prices and stock levels
- **customers**: Customer companies
- **employees**: Sales staff with hierarchy
- **orders**: Customer orders with shipping info
- **order_details**: Line items for each order
- **shippers**: Shipping companies

You can help users:
- Analyze sales data and order history
- Find products by category or supplier
- Look up customer and employee information
- Generate business insights

Use the AFS tools to query the database:
- List tables: afs_list("/modules/northwind")
- List products: afs_list("/modules/northwind/products")
- Read a product: afs_read("/modules/northwind/products/1")
- Search: afs_search("/modules/northwind", "Chai")
- Get schema: afs_read("/modules/northwind/products/@schema")`,
  inputKey: "message",
  afs,
});

await runWithAIGNE(agent, {
  aigne,
  chatLoopOptions: {
    welcome: `Northwind Business Assistant

I have access to the Northwind database with:
- 8 product categories
- 10 suppliers from around the world
- 20 products with pricing and inventory
- 15 customers
- 5 employees
- Sample orders and order details

Try asking:
- "What tables are in the database?"
- "Show me all products in the Beverages category"
- "Who are the customers from Germany?"
- "What products are low on stock?"
- "Search for 'Tofu'"`,
  },
});
