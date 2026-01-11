# AIGNE Generative UI

> **AI-Generated Interactive User Interfaces for AIGNE Framework**

## Overview

AIGNE Generative UI extends the AIGNE Framework with the ability to dynamically generate and manage interactive user interfaces through AI. Instead of AI agents returning only text responses, they can now **construct and update UI components** in real-time.

### Core Concept

Traditional AI interaction:

```
User: "Show me user analytics"
AI: "Here are the analytics: ..."  [text only]
```

With AIGNE Generative UI:

```
User: "Show me user analytics"
AI: [Renders interactive dashboard with charts, filters, and live data]
```

## Key Innovation

**UI Components as Agent Skills** - React/Terminal components are registered as callable skills that AI agents can invoke with typed parameters, enabling the AI to construct interfaces declaratively.

```typescript
// AI invokes:
{
  skill: "ui_dashboard",
  params: {
    charts: [{ type: "line", data: [...] }],
    filters: ["date", "category"]
  }
}

// Renders:
<Dashboard charts={...} filters={...} />
```

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                    AIGNE Generative UI                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐          ┌────────────────┐            │
│  │  CLI Version   │          │  Web Version   │            │
│  │                │          │                │            │
│  │  • Terminal UI │          │  • React UI    │            │
│  │  • Ink.js      │          │  • MUI         │            │
│  │  • ink-table   │          │  • Recharts    │            │
│  │  • ink-chart   │          │  • DataGrid    │            │
│  └────────────────┘          └────────────────┘            │
│           │                           │                     │
│           └───────────┬───────────────┘                     │
│                       │                                     │
│              ┌────────▼────────┐                           │
│              │   UIAgent       │                           │
│              │                 │                           │
│              │  • Component    │                           │
│              │    Registry     │                           │
│              │  • Streaming    │                           │
│              │  • State Mgmt   │                           │
│              └────────┬────────┘                           │
│                       │                                     │
│              ┌────────▼────────┐                           │
│              │  AFS Storage    │                           │
│              │                 │                           │
│              │  • Component    │                           │
│              │    State        │                           │
│              │  • UI History   │                           │
│              └─────────────────┘                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Features

### ✨ Declarative Component Generation

- AI selects and invokes UI components based on user intent
- Components defined with Zod schemas for type safety
- Progressive rendering as component props stream in

### 🔄 Real-time Streaming

- Props stream incrementally from AI model
- Partial JSON parsing for progressive updates
- Visual feedback during component generation

### 💾 Message-Based State (Tambo-Inspired)

- Component state stored directly in messages
- No separate state tables - messages ARE the history
- AI can read previous state from conversation
- Simple, elegant, and AIGNE-native

### 🎨 Rich Component Library

- **CLI**: Terminal dashboards, tables, charts, forms
- **Web**: React components (MUI, Recharts, custom)
- Extensible component registry

### 🔌 Native AIGNE Integration

- Leverages existing skill system (ui\_ prefix pattern)
- Works with all AIGNE workflow patterns
- Compatible with MCP servers and AFS modules

## Use Cases

### 1. Data Visualization

```
User: "Show me sales trends for Q4"
AI: [Renders interactive chart with filters and drill-down]
```

### 2. Dynamic Forms

```
User: "I need to collect user feedback"
AI: [Generates customized form with validation]
```

### 3. Interactive Dashboards

```
User: "Build me a project status dashboard"
AI: [Creates multi-panel dashboard with real-time updates]
```

### 4. CLI Tools

```
User: "Monitor system resources"
AI: [Shows live terminal UI with CPU, memory, network graphs]
```

### 5. Configuration Builders

```
User: "Help me configure the deployment"
AI: [Interactive step-by-step configuration wizard]
```

## Project Structure

```
aigne-framework/
├── packages/
│   ├── core/
│   ├── cli/
│   └── ...
├── afs/
│   ├── core/                   # @aigne/afs
│   ├── history/                # @aigne/afs-history
│   └── ...
├── ui/                         # NEW - follows AFS pattern
│   ├── README.md               # Overview of all UI packages
│   ├── core/                   # @aigne/ui
│   │   ├── src/
│   │   │   ├── types.ts
│   │   │   ├── component.ts
│   │   │   ├── registry.ts
│   │   │   ├── ui-agent.ts
│   │   │   └── index.ts
│   │   └── package.json
│   ├── cli/                    # @aigne/ui-cli
│   │   ├── src/
│   │   │   ├── components/     # Terminal components
│   │   │   ├── ui-agent-cli.ts
│   │   │   └── index.ts
│   │   └── package.json
│   └── web/                    # @aigne/ui-web
│       ├── src/
│       │   ├── components/     # React components
│       │   ├── hooks/
│       │   ├── ui-agent-web.tsx
│       │   └── index.ts
│       └── package.json
├── examples/
│   ├── ui-cli-demo/            # CLI demo
│   └── ui-web-demo/            # Web app demo
└── docs/
    └── generative-ui/          # This documentation
        ├── ARCHITECTURE.md     # Detailed architecture
        ├── CLI_VERSION.md      # CLI implementation
        ├── WEB_VERSION.md      # Web implementation
        ├── IMPLEMENTATION_PLAN.md  # Roadmap
        └── EXAMPLES.md         # Usage examples
```

## Quick Start (Conceptual)

### CLI Version

```typescript
import { AIGNE } from '@aigne/core';
import { OpenAIChatModel } from '@aigne/openai';
import { UIAgent } from '@aigne/ui-cli';
import { TerminalDashboard, TerminalChart } from '@aigne/ui-cli/components';

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

const uiAgent = UIAgent.from({
  name: 'AnalyticsAgent',
  instructions: 'You help users visualize data',
  components: [TerminalDashboard, TerminalChart],
});

const session = aigne.invoke(uiAgent);
await session.invoke({
  message: 'Show me server metrics',
});
// AI generates terminal UI with live charts
```

### Web Version

```typescript
import { AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { UIAgent } from "@aigne/ui-web";
import { Dashboard, LineChart, BarChart } from "@aigne/ui-web/components";

const aigne = new AIGNE({
  model: new OpenAIChatModel()
});

const uiAgent = UIAgent.from({
  name: "AnalyticsAgent",
  instructions: "You help users visualize data",
  components: [
    Dashboard,
    LineChart,
    BarChart
  ]
});

// In React component:
function App() {
  const { messages, sendMessage } = useAIGNE(uiAgent);

  return (
    <div>
      {messages.map(msg =>
        msg.component ? <msg.component {...msg.props} /> : msg.text
      )}
      <input onSubmit={sendMessage} />
    </div>
  );
}
```

## Design Principles

### 1. **AIGNE-Native**

Generative UI is built as a natural extension of AIGNE, not a separate framework. It uses:

- The existing skill system (ui components = skills with `ui_` prefix)
- AFS for state persistence
- AIGNE's event system for reactivity
- Standard agent patterns (streaming, tool calls, etc.)

### 2. **Progressive Enhancement**

- Start with simple text responses
- Add UI components incrementally
- Graceful degradation for unsupported environments

### 3. **Type Safety**

- Zod schemas for component props
- TypeScript throughout
- Runtime validation

### 4. **Developer Experience**

- Familiar React patterns (web)
- Familiar terminal UI patterns (CLI)
- Minimal configuration
- Hot reload during development

### 5. **AI-First**

- Components designed for AI consumption
- Clear descriptions for LLM understanding
- Sensible defaults
- Error-tolerant prop handling

## Documentation

- **[Architecture Design](./ARCHITECTURE.md)** - Deep dive into system architecture
- **[CLI Implementation](./CLI_VERSION.md)** - Terminal UI version details
- **[Web Implementation](./WEB_VERSION.md)** - React version details
- **[Implementation Plan](./IMPLEMENTATION_PLAN.md)** - Phased development roadmap
- **[Examples](./EXAMPLES.md)** - Code examples and use cases

## Comparison with Tambo AI

| Aspect            | Tambo AI                 | AIGNE Generative UI                           |
| ----------------- | ------------------------ | --------------------------------------------- |
| **Focus**         | Web-first, React-only    | CLI + Web, multi-environment                  |
| **State**         | Database (PostgreSQL)    | AFS (pluggable, can be SQLite, files, memory) |
| **Agent System**  | Custom architecture      | AIGNE's proven agent patterns                 |
| **Integration**   | Standalone framework     | Natural AIGNE extension                       |
| **Streaming**     | SSE (Server-Sent Events) | AIGNE's native streaming                      |
| **Extensibility** | Components + Tools + MCP | Skills + AFS modules + MCP (already in AIGNE) |
| **CLI Support**   | None                     | First-class terminal UI                       |

## Next Steps

1. **Review Architecture** - Read [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **Choose Version** - Start with [CLI](./CLI_VERSION.md) or [Web](./WEB_VERSION.md)
3. **Follow Plan** - See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
4. **Build Prototype** - Use examples as starting point

## Contributing

This is an experimental design for extending AIGNE Framework. Feedback and contributions are welcome!

## License

Elastic-2.0 (same as AIGNE Framework)
