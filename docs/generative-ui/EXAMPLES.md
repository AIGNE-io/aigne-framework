# AIGNE Generative UI - Examples

Practical examples demonstrating generative UI capabilities across different use cases.

## Table of Contents

1. [CLI Examples](#cli-examples)
2. [Web Examples](#web-examples)
3. [Hybrid Examples](#hybrid-examples)
4. [Advanced Patterns](#advanced-patterns)

---

## CLI Examples

### 1. System Monitor

**Use Case**: Real-time system resource monitoring

```typescript
import { AIGNE } from '@aigne/core';
import { OpenAIChatModel } from '@aigne/openai';
import { UIAgent } from '@aigne/generative-ui/cli';
import { TerminalDashboard, TerminalChart } from '@aigne/generative-ui/cli/components';
import os from 'os';

// Create agent
const systemMonitor = UIAgent.forCLI({
  name: 'SystemMonitor',
  instructions: `You help users monitor system resources.
When asked about system metrics, use ui_Dashboard and ui_Chart to display information.`,

  components: [TerminalDashboard, TerminalChart],

  // Add custom skill for fetching metrics
  skills: [
    {
      name: 'get_system_metrics',
      description: 'Get current system resource usage',
      inputSchema: z.object({}),
      async execute() {
        const cpus = os.cpus();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;

        return {
          cpu: {
            count: cpus.length,
            usage: Math.random() * 100, // Simplified
          },
          memory: {
            total: totalMem,
            used: usedMem,
            free: freeMem,
            usagePercent: (usedMem / totalMem) * 100,
          },
          uptime: os.uptime(),
        };
      },
    },
  ],

  afs: setupAFS(),
});

// Run
const aigne = new AIGNE({ model: new OpenAIChatModel() });
const session = aigne.invoke(systemMonitor);

await session.invoke({
  message: 'Show me system resources',
});

// AI will:
// 1. Call get_system_metrics
// 2. Invoke ui_Dashboard with metrics
// 3. Display:
//    ┌─────────────────┬─────────────────┐
//    │ CPU Usage       │ Memory Used     │
//    │ 45.2%          │ 8.2 GB / 16 GB  │
//    ├─────────────────┼─────────────────┤
//    │ Uptime          │ Load Average    │
//    │ 5d 3h 22m      │ 2.3, 2.1, 1.9  │
//    └─────────────────┴─────────────────┘
```

**Interaction Flow**:

```
User: "Monitor CPU and memory"
AI: [Calls get_system_metrics]
AI: [Invokes ui_Dashboard with real-time data]
Terminal: [Displays live updating dashboard]

User: "Show CPU history as a chart"
AI: [Invokes ui_Chart with time-series data]
Terminal: [Displays ASCII chart with CPU usage over time]
```

### 2. Database Query Tool

**Use Case**: Interactive database exploration

```typescript
import { UIAgent } from '@aigne/generative-ui/cli';
import { TerminalTable } from '@aigne/generative-ui/cli/components';
import Database from 'better-sqlite3';

const dbExplorer = UIAgent.forCLI({
  name: 'DatabaseExplorer',
  instructions: `You help users query and explore a SQLite database.
Use ui_Table to display query results in a formatted table.`,

  components: [TerminalTable],

  skills: [
    {
      name: 'query_database',
      description: 'Execute SQL query and return results',
      inputSchema: z.object({
        query: z.string().describe('SQL query to execute'),
      }),
      async execute({ query }) {
        const db = new Database('./app.db');
        const results = db.prepare(query).all();
        db.close();

        return {
          rows: results,
          count: results.length,
        };
      },
    },
  ],

  afs: setupAFS(),
});

// Usage:
const session = aigne.invoke(dbExplorer);

await session.invoke({
  message: 'Show me all active users',
});

// AI generates:
// 1. query_database("SELECT * FROM users WHERE status = 'active'")
// 2. ui_Table with results:
//
//    Active Users (42 rows)
//    ┌────────┬─────────────────┬──────────────────────┬──────────┐
//    │ ID     │ Name            │ Email                │ Status   │
//    ├────────┼─────────────────┼──────────────────────┼──────────┤
//    │ 1      │ Alice Johnson   │ alice@example.com    │ active   │
//    │ 2      │ Bob Smith       │ bob@example.com      │ active   │
//    │ ...    │ ...             │ ...                  │ ...      │
//    └────────┴─────────────────┴──────────────────────┴──────────┘
```

### 3. Configuration Wizard

**Use Case**: Interactive setup process

```typescript
import { UIAgent } from '@aigne/generative-ui/cli';
import { TerminalForm } from '@aigne/generative-ui/cli/components';
import fs from 'fs/promises';

const configWizard = UIAgent.forCLI({
  name: 'ConfigWizard',
  instructions: `You help users configure their application.
Use ui_Form to collect configuration values interactively.`,

  components: [TerminalForm],

  skills: [
    {
      name: 'save_config',
      description: 'Save configuration to file',
      inputSchema: z.object({
        config: z.record(z.any()),
      }),
      async execute({ config }) {
        await fs.writeFile('./config.json', JSON.stringify(config, null, 2));
        return { saved: true };
      },
    },
  ],

  afs: setupAFS(),
});

// Usage:
await session.invoke({
  message: 'Help me configure the deployment',
});

// AI generates ui_Form:
//
//    Deployment Configuration
//
//    * Region: [us-west-2        ]
//      Instance Type: [t3.medium        ]
//      Min Instances: [2                ]
//      Max Instances: [10               ]
//      Enable Auto-scaling: [Yes         ]
//
//    Press Enter to continue • Field 1 of 5
//
// After completion:
// - AI calls save_config with collected values
// - Confirms: "✓ Configuration saved to config.json"
```

---

## Web Examples

### 1. Analytics Dashboard

**Use Case**: Business metrics visualization

```typescript
import { UIAgent } from "@aigne/generative-ui/web";
import { WebDashboard, WebChart, WebTable } from "@aigne/generative-ui/web/components";

const analyticsAgent = UIAgent.forWeb({
  name: "AnalyticsAgent",
  instructions: `You help users visualize business analytics.
Use dashboards, charts, and tables to present data clearly.`,

  components: [WebDashboard, WebChart, WebTable],

  skills: [{
    name: "fetch_analytics",
    description: "Fetch analytics data for a date range",
    inputSchema: z.object({
      metric: z.enum(["revenue", "users", "engagement"]),
      startDate: z.string(),
      endDate: z.string()
    }),
    async execute({ metric, startDate, endDate }) {
      // Fetch from analytics API
      const data = await analytics.query(metric, startDate, endDate);
      return data;
    }
  }],

  afs: setupAFS()
});

// In React:
import { Container, Typography } from "@mui/material";

function AnalyticsPage() {
  const { messages, sendMessage } = useAIGNE(analyticsAgent);

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {messages.map((msg, idx) => (
        msg.component ? (
          <msg.component.element key={idx} />
        ) : (
          <Typography key={idx}>{msg.text}</Typography>
        )
      ))}

      <ChatInput onSubmit={sendMessage} />
    </Container>
  );
}

// User: "Show me revenue for last month"
// AI:
// 1. Calls fetch_analytics("revenue", "2025-12-01", "2025-12-31")
// 2. Invokes ui_Dashboard with:
//    - Total Revenue: $124,500
//    - Growth: +15.3%
//    - Top Product: Pro Plan
// 3. Invokes ui_Chart with daily revenue trend
```

### 2. Project Management Board

**Use Case**: Interactive task management

```typescript
import { UIAgent } from '@aigne/generative-ui/web';
import { WebKanbanBoard, WebTaskCard, WebModal } from '@aigne/generative-ui/web/components';

const projectAgent = UIAgent.forWeb({
  name: 'ProjectManager',
  instructions: `You help users manage projects and tasks.
Use Kanban boards to visualize task status and modals for task details.`,

  components: [WebKanbanBoard, WebTaskCard, WebModal],

  skills: [
    {
      name: 'fetch_tasks',
      description: 'Get tasks for a project',
      inputSchema: z.object({ projectId: z.string() }),
      async execute({ projectId }) {
        return await db.tasks.findMany({ projectId });
      },
    },
    {
      name: 'update_task_status',
      description: 'Move task to different status',
      inputSchema: z.object({
        taskId: z.string(),
        status: z.enum(['todo', 'in_progress', 'done']),
      }),
      async execute({ taskId, status }) {
        return await db.tasks.update({ taskId, status });
      },
    },
  ],

  afs: setupAFS(),
});

// User: "Show me the development project board"
// AI:
// 1. Calls fetch_tasks("dev-project")
// 2. Invokes ui_KanbanBoard with columns:
//
//    ┌────────────┬────────────┬────────────┐
//    │   To Do    │ In Progress│    Done    │
//    ├────────────┼────────────┼────────────┤
//    │ • Add auth │ • API tests│ • Setup DB │
//    │ • Write    │ • UI polish│ • Deploy   │
//    │   docs     │            │            │
//    └────────────┴────────────┴────────────┘
//
// User can drag tasks between columns
// AI updates via update_task_status
```

### 3. Data Visualization Explorer

**Use Case**: Interactive data exploration

```typescript
import { UIAgent } from '@aigne/generative-ui/web';
import { WebChart, WebTable, WebFilterPanel, WebDataGrid } from '@aigne/generative-ui/web/components';

const dataExplorer = UIAgent.forWeb({
  name: 'DataExplorer',
  instructions: `You help users explore and visualize datasets.
Provide charts, tables, and filtering capabilities.`,

  components: [WebChart, WebTable, WebFilterPanel, WebDataGrid],

  skills: [
    {
      name: 'query_dataset',
      description: 'Query dataset with filters',
      inputSchema: z.object({
        dataset: z.string(),
        filters: z.record(z.any()).optional(),
        groupBy: z.string().optional(),
        aggregation: z.enum(['sum', 'avg', 'count']).optional(),
      }),
      async execute({ dataset, filters, groupBy, aggregation }) {
        return await dataAPI.query(dataset, {
          filters,
          groupBy,
          aggregation,
        });
      },
    },
  ],

  afs: setupAFS(),
});

// User: "Show me sales by region for Q4"
// AI:
// 1. Calls query_dataset("sales", { quarter: "Q4" }, "region", "sum")
// 2. Invokes ui_Chart (bar chart) with regional breakdown
// 3. Invokes ui_Table with detailed numbers
// 4. Invokes ui_FilterPanel for interactive filtering
//
// User can then:
// - Change chart type
// - Apply additional filters
// - Export data
// - Drill down into specific regions
```

---

## Hybrid Examples

### 4. CI/CD Pipeline Monitor

**Both CLI and Web versions**

```typescript
// Shared component definition
const pipelineSchema = z.object({
  pipelines: z.array(z.object({
    id: z.string(),
    name: z.string(),
    status: z.enum(["running", "success", "failed"]),
    duration: z.number(),
    steps: z.array(z.object({
      name: z.string(),
      status: z.enum(["pending", "running", "success", "failed"])
    }))
  }))
});

// CLI version
const PipelineMonitorCLI: UIComponent = {
  name: "PipelineMonitor",
  description: "Monitor CI/CD pipelines",
  environment: "cli",
  propsSchema: pipelineSchema,

  async render(props) {
    // Terminal table with colored status indicators
    return {
      element: renderCLIPipelines(props.pipelines)
    };
  }
};

// Web version
const PipelineMonitorWeb: UIComponent = {
  name: "PipelineMonitor",
  description: "Monitor CI/CD pipelines",
  environment: "web",
  propsSchema: pipelineSchema,

  async render(props) {
    return {
      element: <PipelineGrid pipelines={props.pipelines} />
    };
  }
};

// Same agent works in both environments!
const agent = UIAgent.from({
  name: "CIMonitor",
  components: [
    environment === "cli" ? PipelineMonitorCLI : PipelineMonitorWeb
  ],
  environment,
  afs: setupAFS()
});
```

---

## Advanced Patterns

### 5. Stateful Multi-Step Wizard

**Pattern**: Multi-turn interaction with persistent state

```typescript
const wizardAgent = UIAgent.forWeb({
  name: 'OnboardingWizard',
  instructions: `Guide users through multi-step onboarding.
Track progress in component state.`,

  components: [WebWizard, WebProgressBar],

  afs: setupAFS(),
});

// User: "Start onboarding"
// AI: ui_Wizard (step 1 of 4)
await context.state.set('currentStep', 1);

// User: "Next"
// AI reads state, shows step 2
const step = await context.state.get('currentStep');
await context.state.set('currentStep', step + 1);
// AI: ui_Wizard (step 2 of 4)

// State persists across sessions!
```

### 6. Real-time Collaboration

**Pattern**: Multiple users interacting with same UI

```typescript
const collabAgent = UIAgent.forWeb({
  name: 'CollaborativeEditor',
  instructions: `Enable real-time collaboration on documents.`,

  components: [WebEditor, WebCursorOverlay],

  afs: setupAFS(),
});

// Component state synchronized via AFS
// When user A edits:
await context.state.set('documentContent', newContent);
context.events.emit('documentChanged', { userId: 'A' });

// User B's component receives update via AFS events
// Both see changes in real-time
```

### 7. Progressive Data Loading

**Pattern**: Streaming large datasets

```typescript
const dataLoader = UIAgent.forWeb({
  name: 'DataLoader',
  instructions: `Load and display large datasets progressively.`,

  components: [WebInfiniteTable],

  skills: [
    {
      name: 'fetch_page',
      description: 'Fetch data page by page',
      inputSchema: z.object({
        page: z.number(),
        pageSize: z.number(),
      }),
      async *execute({ page, pageSize }) {
        // Generator for streaming
        const data = await db.query({ page, pageSize });

        for (const row of data) {
          yield { row };
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      },
    },
  ],
});

// User: "Load all transactions"
// AI: ui_InfiniteTable (shows skeleton)
// AI: Streams data rows progressively
// User sees table populate in real-time
```

### 8. Dynamic Form Generation

**Pattern**: AI generates form based on schema

```typescript
const formBuilder = UIAgent.forWeb({
  name: 'FormBuilder',
  instructions: `Generate forms dynamically based on data schemas.`,

  components: [WebDynamicForm],

  skills: [
    {
      name: 'get_schema',
      description: 'Get schema for entity type',
      inputSchema: z.object({
        entityType: z.string(),
      }),
      async execute({ entityType }) {
        const schema = await schemaRegistry.get(entityType);
        return schema;
      },
    },
  ],
});

// User: "Create a new user"
// AI:
// 1. get_schema("user") → { name, email, role, ... }
// 2. ui_DynamicForm with schema
// 3. User fills form
// 4. AI saves with validated data
```

---

## Integration Patterns

### Pattern 1: Agent Chaining with UI

```typescript
// Analysis agent generates data
const analysisAgent = AIAgent.from({
  name: 'DataAnalyzer',
  outputKey: 'analysis',
});

// UI agent visualizes results
const vizAgent = UIAgent.forWeb({
  name: 'DataVisualizer',
  inputKey: 'analysis',
  components: [WebChart],
});

// Chain them
const teamAgent = TeamAgent.from({
  agents: [analysisAgent, vizAgent],
  mode: 'sequential',
});

// User: "Analyze sales trends"
// 1. analysisAgent processes data
// 2. vizAgent renders chart
```

### Pattern 2: Conditional UI Rendering

```typescript
const adaptiveAgent = UIAgent.forWeb({
  name: 'AdaptiveAssistant',
  instructions: `Choose appropriate UI based on data size and type:
- Small datasets (<100 rows): ui_Table
- Medium datasets (100-1000): ui_DataGrid
- Large datasets (>1000): ui_InfiniteTable
- Time-series: ui_Chart
- Categorical: ui_BarChart`,

  components: [WebTable, WebDataGrid, WebInfiniteTable, WebChart, WebBarChart],
});

// AI automatically picks best component!
```

### Pattern 3: UI State Machine

```typescript
const stateMachineAgent = UIAgent.forWeb({
  name: 'WorkflowAgent',
  instructions: `Manage multi-state workflow:
- IDLE → START_FORM
- START_FORM → PROCESSING_SPINNER
- PROCESSING_SPINNER → SUCCESS_MODAL or ERROR_ALERT`,

  components: [WebForm, WebSpinner, WebModal, WebAlert],
});

// Tracks state transitions in component state
// AI knows current state and transitions accordingly
```

---

## Summary

These examples demonstrate:

1. **CLI Use Cases** - System monitoring, database tools, config wizards
2. **Web Use Cases** - Analytics, project management, data exploration
3. **Hybrid Patterns** - Same logic, different UIs
4. **Advanced Patterns** - Stateful, collaborative, progressive
5. **Integration Patterns** - Chaining, conditional rendering, state machines

**Key Takeaways**:

- Components are environment-specific, logic is shared
- State management via AFS enables persistence
- AI chooses appropriate UI based on context
- Progressive rendering handles large datasets
- Streaming enables real-time updates

**Next Steps**:

- Start with simple examples
- Build complexity gradually
- Test in both CLI and Web
- Iterate based on user feedback
