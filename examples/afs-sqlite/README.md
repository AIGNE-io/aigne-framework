# AFS SQLite Example - Northwind Database

This example demonstrates the `@aigne/afs-sqlite` module by mounting a SQLite database populated with the classic Northwind sample data (customers, orders, products, employees, suppliers).

## What You'll See

A business analyst chatbot that can query the Northwind database:

```
Northwind Business Assistant

I have access to the Northwind database with:
- 8 product categories
- 10 suppliers from around the world
- 20 products with pricing and inventory
- 15 customers
- 5 employees
- Sample orders and order details

> What tables are in the database?

The Northwind database contains 8 tables:
- categories (8 rows) - Product categories
- suppliers (10 rows) - Product suppliers
- products (20 rows) - Products for sale
- customers (15 rows) - Customer companies
- employees (5 rows) - Sales staff
- shippers (3 rows) - Shipping companies
- orders (10 rows) - Customer orders
- order_details (25 rows) - Order line items

> Show me products in the Beverages category

Found 3 products in Beverages:
- Chai - $18.00 (39 in stock)
- Chang - $19.00 (17 in stock)
- Guarana Fantastica - $4.50 (20 in stock)
```

## Prerequisites

- Node.js 18+ or Bun runtime
- An AI model API key (OpenAI, Anthropic, or others)

## Quick Start

Run directly without installation:

```bash
OPENAI_API_KEY=sk-xxx npx @aigne/example-afs-sqlite
```

Or with other model providers:

```bash
ANTHROPIC_API_KEY=sk-ant-xxx npx @aigne/example-afs-sqlite --model claude-sonnet
```

## Installation

```bash
# Clone the repository
git clone https://github.com/AIGNE-io/aigne-framework
cd aigne-framework/examples/afs-sqlite

# Install dependencies
pnpm install

# Set up environment
cp .env.local.example .env.local
# Edit .env.local with your API key

# Run the example
pnpm start
```

## How It Works

1. **Database Seeding**: The `seed-data.ts` script creates and populates a SQLite database with Northwind sample data (categories, suppliers, products, customers, employees, orders).

2. **AFS Mount**: The SQLiteAFS module mounts the database as a virtual filesystem, exposing tables as directories and rows as entries.

3. **AI Agent**: The agent has access to AFS tools (`afs_list`, `afs_read`, `afs_search`) to query the database and answer business questions.

## Database Schema

The Northwind database includes 8 related tables:

| Table | Description | Rows |
|-------|-------------|------|
| categories | Product categories | 8 |
| suppliers | International suppliers | 10 |
| products | Products with pricing | 20 |
| customers | Customer companies | 15 |
| employees | Sales staff hierarchy | 5 |
| shippers | Shipping companies | 3 |
| orders | Customer orders | 10 |
| order_details | Order line items | 25 |

## Try These Examples

```
# List all tables
"What tables are in the database?"

# Query products
"Show me all products in the Seafood category"
"What products are low on stock (under 20 units)?"
"List discontinued products"

# Query customers
"Who are the customers from Germany?"
"Find customers in Mexico"

# Query employees
"Who reports to Andrew Fuller?"
"List all sales representatives"

# Search
"Search for 'Tofu'"
"Find suppliers from Japan"

# Schema exploration
"Show me the schema of the orders table"
"What columns does the products table have?"
```

## Persistent Database

By default, the example uses an in-memory database. To persist data:

```bash
pnpm start -- --db ./northwind.db
```

## Related Examples

- [afs-local-fs](../afs-local-fs) - Mount local filesystem
- [afs-memory](../afs-memory) - Conversation memory with AFS
- [mcp-sqlite](../mcp-sqlite) - SQLite via MCP protocol

## Related Packages

- [@aigne/afs-sqlite](../../afs/sqlite) - SQLite AFS module
- [@aigne/afs](../../afs/core) - Core AFS package
- [@aigne/sqlite](../../packages/sqlite) - SQLite utilities

## License

MIT
