# AIGNE Generative UI - CLI Demo

**✅ Status: Working and Tested** - Charts render correctly in terminal!

This example demonstrates AIGNE's generative UI capabilities in a CLI environment using Ink.js for terminal rendering.

## Features

- **UIAgent**: AI agent with UI component generation capabilities
- **SimpleChart**: ASCII bar chart component rendered in terminal
- **Component-as-Skill**: UI components automatically registered as LLM-callable tools
- **State Persistence**: Component state stored in AFSHistory

## Prerequisites

- Bun runtime
- OpenAI API key set in environment

## Installation

```bash
# From repository root
pnpm install

# Build packages
pnpm -F @aigne/ui build
pnpm -F @aigne/ui-cli build
```

## Usage

```bash
# Run the demo
bun run index.ts

# Or with pnpm
pnpm start
```

## Example Prompts

Once running, try these prompts:

```
> Show me a chart of 5, 10, 15, 20
> Visualize these numbers: 3, 7, 2, 9, 5
> Create a chart titled "Sales" with data 100, 150, 200, 180
> Chart the fibonacci sequence: 1, 1, 2, 3, 5, 8, 13
```

## How It Works

1. **UIAgent** extends AIAgent with UI generation capabilities
2. **Chart** and **Table** components are registered as `show_component_chart` and `show_component_table` skills
3. LLM decides when to invoke component tools based on user request
4. `onComponentShow` callback handles environment-specific rendering
5. **createCLIRenderer()** from `@aigne/ui-cli` automatically renders and unmounts Ink components
6. State is persisted to AFSHistory

**Architecture Pattern**:

```typescript
import { createCLIRenderer } from "@aigne/ui-cli";

const agent = UIAgent.forCLI({
  // ... other options ...
  components: [Chart, Table],
  onComponentShow: createCLIRenderer(),  // ✅ Handles Ink render/unmount
});
```

The `onComponentShow` callback is invoked after each component renders, allowing environment-specific rendering logic. For CLI, `createCLIRenderer()` uses Ink's `render()` and `unmount()` lifecycle.

## Architecture

```
User Input → UIAgent → LLM decides to call show_component_chart
                          ↓
                    Component.render() creates element
                          ↓
                    onComponentShow callback invoked
                          ↓
                    createCLIRenderer() renders with Ink
                          ↓
                    State persisted to AFS
                          ↓
                    Chart displayed in terminal → unmount()
```

## Code Structure

- `index.ts` - Main demo application with UIAgent setup
- `skills/` - Custom skills (system metrics, stock prices, GitHub MCP)
- `../../ui/core/` - Core UIAgent, ComponentRegistry, and types
- `../../ui/cli/` - CLI-specific components (Chart, Table) and createCLIRenderer()

## Next Steps

- Add more components (Form, Progress, Spinner, etc.)
- Add streaming support for progressive rendering
- Add component interaction handlers
- Implement component update patterns
