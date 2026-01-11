# AIGNE Generative UI - CLI Version

Terminal-based generative UI for command-line interfaces using Ink.js and its ecosystem.

## Overview

The CLI version enables AI agents to generate interactive terminal UIs, including:

- **Dashboards** - Real-time monitoring and metrics
- **Tables** - Data display with sorting and filtering
- **Charts** - Line charts, bar charts, and sparklines
- **Forms** - Interactive data collection
- **Progress Indicators** - Task status and loading states
- **Menus** - Navigation and selection

## Technology Stack

### Core Libraries

| Library              | Purpose              | Why                             |
| -------------------- | -------------------- | ------------------------------- |
| **Ink.js**           | React for CLI        | Component-based, declarative UI |
| **ink-table**        | Tables               | Native Ink table component      |
| **@pppp606/ink-chart** | Charts             | Ink-native charts (bar, line, sparkline) |
| **ink-spinner**      | Spinners             | Loading indicators              |
| **ink-text-input**   | Text input           | Interactive text fields         |
| **ink-select-input** | Dropdown menus       | Selection lists                 |
| **chalk**            | Colors               | Terminal color output           |

All components are built with Ink.js for consistent React-based CLI development.

### Architecture

```
CLI Components (All Ink.js-based)
     ├── Dashboard (Box, Text)
     ├── Table (ink-table)
     ├── Chart (@pppp606/ink-chart)
     ├── Form (ink-text-input, ink-select-input)
     ├── Progress (ink-spinner)
     └── Menu (ink-select-input)
```

## Component Examples

### 1. Dashboard Component

```typescript
import { z } from "zod";
import React from "react";
import { Box, Text } from "ink";
import { UIComponent } from "@aigne/ui";

export const TerminalDashboard: UIComponent = {
  name: "Dashboard",
  description: `Terminal dashboard with multiple panels.
Use for displaying real-time metrics, status information, or monitoring data.
Supports up to 6 panels in a grid layout.`,

  environment: "cli",

  propsSchema: z.object({
    title: z.string(),
    panels: z.array(z.object({
      title: z.string(),
      value: z.union([z.string(), z.number()]),
      status: z.enum(["success", "warning", "error", "info"]).optional(),
      description: z.string().optional()
    })).max(6),
    layout: z.enum(["2x3", "3x2", "1x4", "4x1"]).optional().default("2x3")
  }),

  async render(props, context) {
    const { title, panels, layout } = props;

    const DashboardComponent = () => (
      <Box flexDirection="column" padding={1}>
        <Box marginBottom={1}>
          <Text bold color="cyan">{title}</Text>
        </Box>

        <Box flexDirection={layout.startsWith("2") ? "row" : "column"}>
          {panels.map((panel, idx) => (
            <Box
              key={idx}
              flexDirection="column"
              borderStyle="round"
              borderColor={getStatusColor(panel.status)}
              padding={1}
              marginRight={1}
              marginBottom={1}
              width="50%"
            >
              <Text bold>{panel.title}</Text>
              <Text color={getStatusColor(panel.status)}>
                {panel.value}
              </Text>
              {panel.description && (
                <Text dimColor>{panel.description}</Text>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    );

    return {
      element: <DashboardComponent />
    };
  }
};

function getStatusColor(status?: string): string {
  switch (status) {
    case "success": return "green";
    case "warning": return "yellow";
    case "error": return "red";
    case "info": return "blue";
    default: return "white";
  }
}
```

### 2. Table Component

```typescript
import { z } from 'zod';
import React from 'react';
import { Box, Text } from 'ink';
import Table from 'ink-table';
import { UIComponent } from '@aigne/ui';

export const TerminalTable: UIComponent = {
  name: 'Table',
  description: `Display tabular data in the terminal.
Supports sorting, highlighting, and custom column formatting.
Best for displaying structured data with multiple fields.`,

  environment: 'cli',

  propsSchema: z.object({
    data: z.array(z.record(z.union([z.string(), z.number()]))),
    columns: z.array(z.string()).optional(), // If not provided, uses all keys
    title: z.string().optional(),
    padding: z.number().min(0).max(5).optional().default(1),
  }),

  async render(props, context) {
    const { data, columns, title, padding } = props;

    const TableComponent = () => (
      <Box flexDirection="column" padding={1}>
        {title && (
          <Box marginBottom={1}>
            <Text bold color="cyan">{title}</Text>
          </Box>
        )}

        <Table
          data={data}
          columns={columns}
          padding={padding}
        />
      </Box>
    );

    return {
      element: <TableComponent />,
    };
  },
};
```

### 3. Chart Component

```typescript
import { z } from 'zod';
import React from 'react';
import { Box, Text } from 'ink';
import { BarChart, LineGraph, Sparkline } from '@pppp606/ink-chart';
import { UIComponent } from '@aigne/ui';

export const TerminalChart: UIComponent = {
  name: 'Chart',
  description: `Render charts in the terminal using Ink components.
Supports line graphs, bar charts, and sparklines.
Best for visualizing trends and time-series data.`,

  environment: 'cli',

  propsSchema: z.object({
    type: z.enum(['line', 'bar', 'sparkline']),
    data: z.array(z.number()),
    title: z.string().optional(),
    height: z.number().min(5).max(20).optional().default(10),
    color: z.enum(['green', 'red', 'blue', 'yellow', 'cyan', 'magenta']).optional().default('cyan'),
    axisLabels: z.array(z.string()).optional(),
  }),

  async render(props, context) {
    const { type, data, title, height, color, axisLabels } = props;

    const ChartComponent = () => (
      <Box flexDirection="column" padding={1}>
        {title && (
          <Box marginBottom={1}>
            <Text bold color="cyan">{title}</Text>
          </Box>
        )}

        {type === 'line' && (
          <LineGraph
            data={data}
            height={height}
            color={color}
            axisLabels={axisLabels}
          />
        )}

        {type === 'bar' && (
          <BarChart
            data={data}
            height={height}
            color={color}
          />
        )}

        {type === 'sparkline' && (
          <Box flexDirection="column">
            <Sparkline data={data} />
            <Box marginTop={1}>
              <Text dimColor>
                Min: {Math.min(...data).toFixed(2)}
                {' • '}
                Max: {Math.max(...data).toFixed(2)}
              </Text>
            </Box>
          </Box>
        )}
      </Box>
    );

    return {
      element: <ChartComponent />,
    };
  },
};
```

### 4. Form Component

```typescript
import { z } from "zod";
import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import SelectInput from "ink-select-input";
import { UIComponent } from "@aigne/ui";

export const TerminalForm: UIComponent = {
  name: "Form",
  description: `Interactive form for collecting user input.
Supports text input, select dropdowns, and validation.
Use when you need to gather structured data from the user.`,

  environment: "cli",

  propsSchema: z.object({
    title: z.string(),
    fields: z.array(z.object({
      id: z.string(),
      label: z.string(),
      type: z.enum(["text", "select", "number"]),
      required: z.boolean().optional().default(false),
      options: z.array(z.string()).optional(),  // For select
      default: z.union([z.string(), z.number()]).optional(),
      validation: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
        pattern: z.string().optional()
      }).optional()
    })),
    submitButtonText: z.string().optional().default("Submit")
  }),

  stateSchema: z.object({
    values: z.record(z.any()),
    submitted: z.boolean().default(false)
  }),

  async render(props, context) {
    const { title, fields, submitButtonText } = props;

    const FormComponent = () => {
      const [currentFieldIdx, setCurrentFieldIdx] = useState(0);
      const [values, setValues] = useState<Record<string, any>>({});
      const [submitted, setSubmitted] = useState(false);

      const currentField = fields[currentFieldIdx];
      const isLastField = currentFieldIdx === fields.length - 1;

      useInput((input, key) => {
        if (key.return && currentField.type !== "select") {
          // Move to next field or submit
          if (isLastField) {
            handleSubmit();
          } else {
            setCurrentFieldIdx(currentFieldIdx + 1);
          }
        }
      });

      const handleSubmit = async () => {
        // Validate all fields
        const errors = validateFormValues(values, fields);
        if (errors.length > 0) {
          // Show errors
          return;
        }

        // Save to component state
        await context.state.update({
          values,
          submitted: true
        });

        setSubmitted(true);

        // Emit event
        context.events.emit("formSubmitted", {
          instanceId: context.instanceId,
          values
        });
      };

      if (submitted) {
        return (
          <Box flexDirection="column" padding={1}>
            <Text color="green">✓ Form submitted successfully!</Text>
            <Text dimColor>Values saved.</Text>
          </Box>
        );
      }

      return (
        <Box flexDirection="column" padding={1}>
          <Box marginBottom={1}>
            <Text bold color="cyan">{title}</Text>
          </Box>

          {fields.map((field, idx) => {
            const isActive = idx === currentFieldIdx;
            const value = values[field.id];

            return (
              <Box key={field.id} marginBottom={1}>
                <Text>
                  {field.required && <Text color="red">* </Text>}
                  {field.label}:{" "}
                </Text>

                {isActive ? (
                  field.type === "select" ? (
                    <SelectInput
                      items={field.options!.map(opt => ({
                        label: opt,
                        value: opt
                      }))}
                      onSelect={item => {
                        setValues({ ...values, [field.id]: item.value });
                        if (!isLastField) {
                          setCurrentFieldIdx(currentFieldIdx + 1);
                        }
                      }}
                    />
                  ) : (
                    <TextInput
                      value={value || ""}
                      onChange={val =>
                        setValues({ ...values, [field.id]: val })
                      }
                    />
                  )
                ) : (
                  <Text color="gray">
                    {value || (field.default ? String(field.default) : "—")}
                  </Text>
                )}
              </Box>
            );
          })}

          <Box marginTop={1}>
            <Text dimColor>
              Field {currentFieldIdx + 1} of {fields.length}
              {" • "}
              Press Enter to continue
            </Text>
          </Box>
        </Box>
      );
    };

    return {
      element: <FormComponent />
    };
  }
};

function validateFormValues(
  values: Record<string, any>,
  fields: any[]
): string[] {
  const errors: string[] = [];

  for (const field of fields) {
    const value = values[field.id];

    if (field.required && !value) {
      errors.push(`${field.label} is required`);
    }

    if (field.validation) {
      if (field.validation.min && value < field.validation.min) {
        errors.push(`${field.label} must be at least ${field.validation.min}`);
      }
      if (field.validation.max && value > field.validation.max) {
        errors.push(`${field.label} must be at most ${field.validation.max}`);
      }
      if (field.validation.pattern && !new RegExp(field.validation.pattern).test(value)) {
        errors.push(`${field.label} format is invalid`);
      }
    }
  }

  return errors;
}
```

## Integration with @aigne/cli

### Enhanced CLI Runner

```typescript
// packages/cli/src/commands/run-ui.ts

import { Command } from "commander";
import { render } from "ink";
import { AIGNE } from "@aigne/core";
import { UIAgent } from "@aigne/ui-cli";
import { setupAFSForUI } from "@aigne/ui";
import {
  TerminalDashboard,
  TerminalChart,
  TerminalTable,
  TerminalForm
} from "@aigne/ui-cli/components";

export const runUICommand = new Command("run-ui")
  .description("Run agent with terminal UI capabilities")
  .option("--path <path>", "Path to agent configuration")
  .option("--model <model>", "AI model to use")
  .action(async (options) => {
    // Initialize AIGNE
    const aigne = new AIGNE({
      model: createModelFromOptions(options)
    });

    // Setup AFS
    const afs = setupAFSForUI(aigne.newContext());

    // Create UIAgent with terminal components
    const uiAgent = UIAgent.forCLI({
      name: "TerminalAssistant",
      instructions: `You are a helpful assistant with terminal UI capabilities.
Use UI components to visualize data and create interactive experiences.`,
      afs,
      components: [
        TerminalDashboard,
        TerminalChart,
        TerminalTable,
        TerminalForm
      ]
    });

    // Create interactive session
    const session = aigne.invoke(uiAgent);

    // Render UI
    const ChatUI = () => {
      const [messages, setMessages] = useState([]);
      const [input, setInput] = useState("");

      const sendMessage = async (text: string) => {
        const result = await session.invoke({ message: text });

        setMessages([
          ...messages,
          { role: "user", content: text },
          result
        ]);
      };

      return (
        <Box flexDirection="column">
          <Box flexDirection="column" marginBottom={1}>
            {messages.map((msg, idx) => (
              <Message key={idx} message={msg} />
            ))}
          </Box>

          <Box>
            <Text>You: </Text>
            <TextInput
              value={input}
              onChange={setInput}
              onSubmit={() => {
                sendMessage(input);
                setInput("");
              }}
            />
          </Box>
        </Box>
      );
    };

    render(<ChatUI />);
  });

function Message({ message }: { message: any }) {
  if (message.component) {
    // Render component
    return message.component.element;
  }

  // Render text
  return (
    <Box marginBottom={1}>
      <Text bold color={message.role === "user" ? "yellow" : "cyan"}>
        {message.role === "user" ? "You" : "AI"}:{" "}
      </Text>
      <Text>{message.content}</Text>
    </Box>
  );
}
```

## Minimal Prototype

### Phase 1: Basic CLI UI (Week 1)

**Goal**: Prove the concept works

```typescript
// Minimal working example

import { AIGNE } from '@aigne/core';
import { OpenAIChatModel } from '@aigne/openai';
import { z } from 'zod';
import chalk from 'chalk';

// 1. Simple component
const SimpleChart = {
  name: 'Chart',
  description: 'Show a simple ASCII chart',
  propsSchema: z.object({
    title: z.string(),
    values: z.array(z.number()),
  }),
  environment: 'cli',
  async render(props: any) {
    const { title, values } = props;
    const max = Math.max(...values);

    let output = chalk.bold(title) + '\n';
    values.forEach((v) => {
      const bar = '█'.repeat(Math.floor((v / max) * 20));
      output += bar + ' ' + v + '\n';
    });

    return { element: output };
  },
};

// 2. Convert to skill
const chartSkill = {
  name: 'ui_chart',
  description: SimpleChart.description,
  inputSchema: SimpleChart.propsSchema,
  async execute(input: any) {
    const output = await SimpleChart.render(input, {} as any);
    console.log(output.element);
    return { rendered: true };
  },
};

// 3. Create agent
const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

const agent = AIAgent.from({
  name: 'ChartBot',
  instructions: 'You can render charts using ui_chart skill',
  skills: [chartSkill],
});

// 4. Run
const session = aigne.invoke(agent);
await session.invoke({
  message: 'Show me a chart of [5, 10, 15, 7, 12]',
});
// AI will invoke ui_chart, chart will be printed
```

**Deliverables**:

- ✅ One working component (Chart)
- ✅ Skill registration working
- ✅ AI can invoke and render
- ✅ ~200 lines of code

### Phase 2: Core Components (Week 2-3)

Add essential components:

- ✅ Table (ink-table)
- ✅ Dashboard (Ink.js Box/Text)
- ✅ Chart (@pppp606/ink-chart)
- ✅ Form (ink-text-input + ink-select-input)
- ✅ Basic state management

### Phase 3: Production Polish (Week 4-6)

- ✅ Error handling
- ✅ Component streaming
- ✅ AFS integration
- ✅ Full test coverage
- ✅ Documentation
- ✅ CLI integration (`aigne run-ui`)

## Production Readiness Checklist

### Core Features

- [ ] 5+ reusable components (Table, Chart, Form, Dashboard, Progress)
- [ ] Component registry with environment detection
- [ ] Streaming props with partial JSON parsing
- [ ] State persistence via AFS
- [ ] Error boundaries with graceful fallbacks

### Integration

- [ ] CLI command: `aigne run-ui`
- [ ] Works with existing agents
- [ ] Compatible with all workflow patterns
- [ ] MCP server integration

### Developer Experience

- [ ] TypeScript types for all components
- [ ] Zod schemas for prop validation
- [ ] Comprehensive examples
- [ ] API documentation
- [ ] Migration guide from text-only

### Quality

- [ ] Unit tests (>80% coverage)
- [ ] Integration tests with real agents
- [ ] Performance benchmarks
- [ ] Memory leak tests
- [ ] Cross-platform testing (macOS, Linux, Windows)

### Documentation

- [ ] Getting started guide
- [ ] Component library reference
- [ ] API documentation
- [ ] Example projects
- [ ] Troubleshooting guide

## Example Use Cases

### 1. System Monitor

```
User: "Monitor system resources"
AI: [Renders live dashboard with CPU, memory, network charts]
    Updates every 2 seconds
    User can press 'q' to quit
```

### 2. Database Query Tool

```
User: "Show users table"
AI: [Renders formatted table with user data]
User: "Filter by active users"
AI: [Updates table with filtered results]
```

### 3. Configuration Wizard

```
User: "Help me configure the deployment"
AI: [Renders interactive form]
    Collects: region, instance type, scaling policy
    Validates input
    Saves to config file
```

## Best Practices

### Component Design

1. **Keep Components Focused**
   - One component = one purpose
   - Compose complex UIs from simple components

2. **Provide Sensible Defaults**
   - Most props should be optional
   - AI can work with minimal information

3. **Clear Descriptions**
   - LLM needs to understand when to use each component
   - Include examples in description

4. **Progressive Disclosure**
   - Show basic info immediately
   - Allow drill-down for details

### Performance

1. **Avoid Excessive Rendering**
   - Debounce updates during streaming
   - Use React.memo for Ink components

2. **Cleanup Resources**
   - Clear intervals/timeouts
   - Remove event listeners
   - Close file handles

3. **Handle Large Datasets**
   - Paginate tables
   - Limit chart data points
   - Virtual scrolling for lists

## Troubleshooting

### Common Issues

1. **Component Not Rendering**
   - Check environment compatibility
   - Verify props schema
   - Look for console errors

2. **Slow Performance**
   - Check for infinite render loops
   - Profile with `NODE_ENV=development`
   - Reduce update frequency

3. **Layout Issues**
   - Terminal size detection
   - Resize handling
   - Unicode character support

## Next Steps

1. **Review Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **Compare with Web**: [WEB_VERSION.md](./WEB_VERSION.md)
3. **Follow Plan**: [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
