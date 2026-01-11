# AIGNE Generative UI - Web Version

React-based generative UI for web applications using modern React libraries.

## Overview

The Web version enables AI agents to generate interactive React UIs with:

- **Dashboards** - Multi-panel analytics
- **Charts** - Recharts visualization
- **Tables** - MUI Table and DataGrid with sorting/filtering
- **Forms** - React Hook Form with validation
- **Modals & Dialogs** - MUI Dialog components

## Technology Stack

| Library | Purpose |
|---------|---------|
| **React 18+** | UI framework |
| **MUI (Material-UI)** | Component library (includes Table, DataGrid) |
| **Recharts** | Charts and graphs |
| **React Hook Form** | Form management |
| **Zod** | Schema validation |
| **@emotion/react** | Styling (CSS-in-JS) |

## Component Examples

### Dashboard Component

```typescript
import { z } from "zod";
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import { UIComponent } from "@aigne/ui-web";

export const WebDashboard: UIComponent = {
  name: "Dashboard",
  description: "Multi-panel dashboard with cards, charts, and metrics",
  environment: "web",

  propsSchema: z.object({
    title: z.string(),
    panels: z.array(z.object({
      title: z.string(),
      value: z.union([z.string(), z.number()]),
      change: z.number().optional(),
      trend: z.enum(["up", "down", "stable"]).optional(),
      icon: z.string().optional()
    })),
    layout: z.enum(["grid-2", "grid-3", "grid-4"]).default("grid-3")
  }),

  async render(props, context) {
    const { title, panels, layout } = props;

    const DashboardComponent = () => (
      <Box sx={{ width: "100%" }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
          {title}
        </Typography>

        <Grid container spacing={2}>
          {panels.map((panel, idx) => (
            <Grid item xs={12} md={getGridSize(layout)} key={idx}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {panel.title}
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ fontWeight: "bold", mt: 1 }}>
                    {panel.value}
                  </Typography>
                  {panel.change && (
                    <Typography
                      variant="caption"
                      sx={{ color: getTrendColor(panel.trend), mt: 0.5 }}
                    >
                      {panel.change > 0 ? "+" : ""}{panel.change}%
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );

    return {
      element: <DashboardComponent />
    };
  }
};

function getGridSize(layout: string): number {
  const map = {
    "grid-2": 6,
    "grid-3": 4,
    "grid-4": 3
  };
  return map[layout];
}

function getTrendColor(trend?: string): string {
  const map = {
    up: "success.main",
    down: "error.main",
    stable: "text.secondary"
  };
  return map[trend || "stable"];
}
```

### Chart Component

```typescript
import { z } from "zod";
import { Box, Paper, Typography } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { UIComponent } from "@aigne/ui-web";

export const WebChart: UIComponent = {
  name: "Chart",
  description: "Interactive charts (line, bar, pie, area)",
  environment: "web",

  propsSchema: z.object({
    type: z.enum(["line", "bar", "pie", "area"]),
    data: z.array(z.record(z.union([z.string(), z.number()]))),
    xKey: z.string(),
    yKeys: z.array(z.string()),
    title: z.string().optional(),
    height: z.number().default(300)
  }),

  async render(props, context) {
    const { type, data, xKey, yKeys, title, height } = props;

    const ChartComponent = () => (
      <Paper elevation={1} sx={{ p: 2, width: "100%" }}>
        {title && (
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "semibold" }}>
            {title}
          </Typography>
        )}

        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {yKeys.map((key, idx) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[idx % COLORS.length]}
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    );

    return {
      element: <ChartComponent />
    };
  }
};

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c"];
```

## React Hook Integration

```typescript
// useAIGNE hook for React apps

import { useState, useEffect, useCallback } from "react";
import { AIGNE } from "@aigne/core";
import { UIAgent } from "@aigne/ui-web";

export function useAIGNE(agent: UIAgent) {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const aigne = new AIGNE({ model: getModel() });
    const newSession = aigne.invoke(agent);
    setSession(newSession);
  }, [agent]);

  const sendMessage = useCallback(async (text: string) => {
    if (!session) return;

    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, {
      role: "user",
      content: text
    }]);

    try {
      // Invoke agent with streaming
      const result = await session.invoke({ message: text });

      // Add AI response
      setMessages(prev => [...prev, result]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  return {
    messages,
    sendMessage,
    isLoading
  };
}
```

## Streaming Components

```typescript
// Progressive component rendering

export function StreamingComponent({ componentName, initialProps }: Props) {
  const [props, setProps] = useState(initialProps);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const streamProps = streamComponentProps(componentName);

    const subscription = streamProps.subscribe({
      next: (update) => {
        setProps(prev => ({ ...prev, ...update }));
      },
      complete: () => {
        setIsComplete(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [componentName]);

  if (!isComplete) {
    return <ComponentSkeleton />;
  }

  return <Component {...props} />;
}
```

## Minimal Prototype

### Quick Start (30 minutes)

```typescript
// 1. Install dependencies
// npm install @aigne/core @aigne/ui @aigne/ui-web recharts @mui/material@^7.3.7 @emotion/react@^11.14.0 @emotion/styled@^11.14.1

// 2. Create simple chart component
const SimpleChart: UIComponent = {
  name: "Chart",
  description: "Show a chart",
  environment: "web",
  propsSchema: z.object({
    data: z.array(z.object({ x: z.number(), y: z.number() }))
  }),
  async render(props) {
    return {
      element: <LineChart data={props.data} />
    };
  }
};

// 3. Create UIAgent
const agent = UIAgent.forWeb({
  name: "ChartBot",
  components: [SimpleChart],
  afs: setupAFS()
});

// 4. Use in React
function App() {
  const { messages, sendMessage } = useAIGNE(agent);

  return (
    <div>
      {messages.map(msg =>
        msg.component ? msg.component.element : <p>{msg.text}</p>
      )}
      <input onSubmit={e => sendMessage(e.target.value)} />
    </div>
  );
}
```

## Production Checklist

- [ ] 10+ UI components (charts, tables, forms, modals)
- [ ] React Hook integration (`useAIGNE`, `useComponentState`)
- [ ] Streaming with loading states
- [ ] Error boundaries
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Responsive design with MUI Grid/Box
- [ ] MUI theme customization (light/dark mode)
- [ ] TypeScript types with MUI theme typing
- [ ] Storybook demos
- [ ] Unit tests with React Testing Library

## Integration Examples

### Next.js App

```typescript
// app/page.tsx
"use client";

import { Box, Container, Stack } from "@mui/material";
import { useAIGNE } from "@aigne/ui-web";
import { createUIAgent } from "./agent";

export default function Home() {
  const agent = createUIAgent();
  const { messages, sendMessage } = useAIGNE(agent);

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Stack spacing={2}>
        {messages.map((msg, idx) => (
          <MessageItem key={idx} message={msg} />
        ))}
      </Stack>

      <ChatInput onSubmit={sendMessage} />
    </Container>
  );
}
```

### Vite App

```typescript
// src/App.tsx
import { UIAgent } from "@aigne/ui-web";
import { useState } from "react";

function App() {
  const [agent] = useState(() => UIAgent.forWeb({
    components: [/* ... */]
  }));

  return <AIGNEChat agent={agent} />;
}
```

## Best Practices

1. **Component Composition** - Build complex UIs from simple components
2. **Loading States** - Show skeletons during streaming
3. **Error Handling** - Use error boundaries
4. **Accessibility** - ARIA labels, keyboard navigation
5. **Performance** - React.memo, lazy loading
6. **Responsive Design** - Mobile-first approach

## Next Steps

1. Review [ARCHITECTURE.md](./ARCHITECTURE.md)
2. See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
3. Try [EXAMPLES.md](./EXAMPLES.md)
