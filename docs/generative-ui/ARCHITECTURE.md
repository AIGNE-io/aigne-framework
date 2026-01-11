# AIGNE Generative UI - Architecture Design

This document details the architectural design for integrating generative UI capabilities into the AIGNE Framework.

## Table of Contents

1. [Core Architecture](#core-architecture)
2. [Component System](#component-system)
3. [UIAgent Design](#uiagent-design)
4. [State Management](#state-management)
5. [Streaming & Rendering](#streaming--rendering)
6. [AFS Integration](#afs-integration)
7. [Skill System Extension](#skill-system-extension)
8. [Data Flow](#data-flow)
9. [Type System](#type-system)
10. [Error Handling](#error-handling)

---

## Core Architecture

### System Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                       Presentation Layer                         │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │  Terminal UI     │              │   React UI       │        │
│  │    (Ink.js)      │              │   (Next.js/Vite) │        │
│  └────────┬─────────┘              └────────┬─────────┘        │
└───────────┼────────────────────────────────┼──────────────────┘
            │                                 │
┌───────────┼────────────────────────────────┼──────────────────┐
│           │      Component Registry         │                  │
│  ┌────────▼────────┐              ┌────────▼────────┐        │
│  │  CLIComponent   │              │  WebComponent   │        │
│  │  Registry       │              │  Registry       │        │
│  └────────┬────────┘              └────────┬────────┘        │
│           └───────────────┬────────────────┘                  │
└───────────────────────────┼───────────────────────────────────┘
                            │
┌───────────────────────────▼───────────────────────────────────┐
│                       UIAgent Layer                            │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  UIAgent extends AIAgent                                  │ │
│  │  • Component registration                                 │ │
│  │  • Skill generation (ui_ prefix)                          │ │
│  │  • Streaming coordination                                 │ │
│  │  • State synchronization                                  │ │
│  └──────────────────────────────────────────────────────────┘ │
└───────────────────────────┬───────────────────────────────────┘
                            │
┌───────────────────────────▼───────────────────────────────────┐
│                      AIGNE Core Layer                          │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  AIAgent • ChatModel • Skills • Streaming • Events       │ │
│  └──────────────────────────────────────────────────────────┘ │
└───────────────────────────┬───────────────────────────────────┘
                            │
┌───────────────────────────▼───────────────────────────────────┐
│                       Storage Layer (AFS)                      │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Conversation/Messages      - Chat history + UI state     │ │
│  │  • Standard message fields  (role, content, timestamp)    │ │
│  │  • Component data           (name, props, state)          │ │
│  │  • Tool calls               (if any)                      │ │
│  │  /modules/user-profile/     - User preferences            │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Extend, Don't Replace**
   - UIAgent extends AIAgent, inheriting all capabilities
   - Component system builds on existing skill system
   - No changes to AIGNE core needed

2. **Environment-Agnostic Core**
   - Core logic independent of UI environment
   - CLI and Web share same UIAgent
   - Components implement environment-specific rendering

3. **Message-Based State** (Inspired by Tambo AI)
   - Component state stored directly in messages
   - No separate state/history tables needed
   - Messages ARE the history - simple and elegant
   - Uses AIGNE's existing conversation storage

---

## Component System

### Component Interface

```typescript
import { z } from 'zod';

/**
 * Base component definition
 * Environment-agnostic interface
 */
export interface UIComponent<TProps = any> {
  // Metadata
  name: string;
  description: string;

  // Schema
  propsSchema: z.ZodType<TProps>;

  // Rendering
  render: (props: TProps, context: ComponentContext) => Promise<ComponentOutput>;

  // Optional lifecycle hooks
  onMount?: (props: TProps, context: ComponentContext) => void;
  onUpdate?: (props: TProps, context: ComponentContext) => void;
  onUnmount?: (context: ComponentContext) => void;

  // Optional state schema
  stateSchema?: z.ZodType;

  // Environment hint
  environment: 'cli' | 'web' | 'universal';
}

/**
 * Component rendering context
 */
export interface ComponentContext {
  // Component instance ID
  instanceId: string;

  // State management
  state: ComponentState;

  // AFS access
  afs: AFS;

  // Event emitter
  events: EventEmitter;

  // AIGNE context
  aigneContext: AIGNEContext;

  // Environment-specific data
  env: Record<string, any>;
}

/**
 * Component output
 */
export interface ComponentOutput {
  // Rendered element (environment-specific)
  element: any;

  // Updates to component state
  stateUpdates?: Record<string, any>;

  // Events to emit
  events?: Array<{ type: string; data: any }>;
}

/**
 * Component state manager
 * Stores state in the message that owns this component
 */
export class ComponentState {
  private state: Record<string, any> = {};

  constructor(
    private messageId: string,
    initialState?: Record<string, any>,
    private schema?: z.ZodType
  ) {
    this.state = initialState || {};
  }

  get<T = any>(key: string): T | undefined {
    return this.state[key] as T;
  }

  set<T = any>(key: string, value: T): void {
    // Validate if schema provided
    if (this.schema) {
      this.schema.parse({ [key]: value });
    }

    this.state[key] = value;
  }

  getAll<T = Record<string, any>>(): T {
    return this.state as T;
  }

  update(updates: Record<string, any>): void {
    Object.assign(this.state, updates);
  }

  /**
   * Returns current state for persistence in message
   */
  toJSON(): Record<string, any> {
    return { ...this.state };
  }
}
```

### Component Registration

```typescript
/**
 * Component registry
 * Manages available UI components
 */
export class ComponentRegistry {
  private components = new Map<string, UIComponent>();

  register(component: UIComponent): void {
    this.components.set(component.name, component);
  }

  get(name: string): UIComponent | undefined {
    return this.components.get(name);
  }

  list(environment?: 'cli' | 'web' | 'universal'): UIComponent[] {
    const all = Array.from(this.components.values());
    if (!environment) return all;

    return all.filter((c) => c.environment === environment || c.environment === 'universal');
  }

  /**
   * Convert components to AIGNE skills
   * Skills will have "ui_" prefix
   */
  toSkills(): AgentSkill[] {
    return Array.from(this.components.values()).map((component) => this.componentToSkill(component));
  }

  private componentToSkill(component: UIComponent): AgentSkill {
    return {
      name: `ui_${component.name}`,
      description: component.description,
      inputSchema: component.propsSchema,
      outputSchema: z.object({
        instanceId: z.string(),
        componentName: z.string(),
        rendered: z.boolean(),
      }),
      async execute(input: any, context: any) {
        // Generate unique instance ID
        const instanceId = `${component.name}_${Date.now()}`;

        // Create component context
        const componentContext: ComponentContext = {
          instanceId,
          state: new ComponentState(instanceId, context.afs),
          afs: context.afs,
          events: context.events,
          aigneContext: context.aigneContext,
          env: context.env || {},
        };

        // Render component
        const output = await component.render(input, componentContext);

        // Apply state updates
        if (output.stateUpdates) {
          await componentContext.state.update(output.stateUpdates);
        }

        // Emit events
        if (output.events) {
          for (const event of output.events) {
            componentContext.events.emit(event.type, event.data);
          }
        }

        return {
          instanceId,
          componentName: component.name,
          rendered: true,
          element: output.element,
        };
      },
    };
  }
}
```

---

## UIAgent Design

### UIAgent Class

```typescript
import { AIAgent, type AIAgentOptions } from '@aigne/core';
import { z } from 'zod';

/**
 * UIAgent extends AIAgent with UI generation capabilities
 */
export interface UIAgentOptions extends AIAgentOptions {
  // Component registry
  components?: UIComponent[];

  // Component environment
  environment: 'cli' | 'web';

  // AFS for state persistence
  afs: AFS;

  // Optional UI-specific instructions
  uiInstructions?: string;
}

export class UIAgent extends AIAgent {
  private componentRegistry: ComponentRegistry;
  private environment: 'cli' | 'web';

  constructor(options: UIAgentOptions) {
    // Add UI-specific system instructions
    const enhancedOptions = {
      ...options,
      instructions: combineInstructions(options.instructions, options.uiInstructions || DEFAULT_UI_INSTRUCTIONS),
    };

    super(enhancedOptions);

    this.environment = options.environment;
    this.componentRegistry = new ComponentRegistry();

    // Register provided components
    if (options.components) {
      for (const component of options.components) {
        // Validate environment compatibility
        if (component.environment !== 'universal' && component.environment !== this.environment) {
          console.warn(
            `Component ${component.name} is for ${component.environment} ` +
              `but agent is running in ${this.environment}`
          );
          continue;
        }

        this.componentRegistry.register(component);
      }
    }

    // Convert components to skills and register them
    const uiSkills = this.componentRegistry.toSkills();
    for (const skill of uiSkills) {
      this.registerSkill(skill);
    }
  }

  /**
   * Register additional components after construction
   */
  registerComponent(component: UIComponent): void {
    this.componentRegistry.register(component);

    // Convert to skill and register
    const skill = this.componentToSkill(component);
    this.registerSkill(skill);
  }

  /**
   * Get list of available UI components
   */
  getComponents(): UIComponent[] {
    return this.componentRegistry.list(this.environment);
  }

  /**
   * Factory method for CLI version
   */
  static forCLI(options: Omit<UIAgentOptions, 'environment'>): UIAgent {
    return new UIAgent({
      ...options,
      environment: 'cli',
    });
  }

  /**
   * Factory method for Web version
   */
  static forWeb(options: Omit<UIAgentOptions, 'environment'>): UIAgent {
    return new UIAgent({
      ...options,
      environment: 'web',
    });
  }
}

/**
 * Default UI instructions for LLM
 */
const DEFAULT_UI_INSTRUCTIONS = `
You have access to UI components that you can render for the user.
These are special skills prefixed with "ui_".

When the user requests visualization, dashboards, forms, or any interactive UI:
1. Select the appropriate UI component
2. Provide all required props according to the schema
3. The component will be rendered automatically

Available UI components are listed in your skills.
Each ui_* skill corresponds to a renderable component.

Guidelines:
- Use UI components for data visualization, forms, tables, dashboards
- Provide clear, complete props - the component needs all required fields
- For complex UIs, break into multiple components if needed
- You can update component state using the component's state management
`.trim();
```

---

## State Management

### UI State AFS Module

```typescript
import type { AFSModule, AFSEntry, AFSRoot } from '@aigne/afs';
import { Storage } from '@aigne/sqlite';

/**
 * Message structure with component data
 * Inspired by Tambo AI's approach - state lives in messages
 */
export interface AIGNEMessageWithComponent {
  // Standard message fields
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: Date;

  // Component data (optional, only for assistant messages with UI)
  component?: {
    name: string;              // Component name (e.g., "Dashboard")
    props: Record<string, any>; // Component props
    state?: Record<string, any>; // Component state (persisted here!)
  };

  // Tool calls (if any)
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, any>;
  }>;

  // Metadata
  metadata?: Record<string, any>;
}

/**
 * Example message with component state:
 */
const exampleMessage: AIGNEMessageWithComponent = {
  id: 'msg_123',
  role: 'assistant',
  content: 'Here is your dashboard',
  timestamp: new Date(),

  // Component rendered in this message
  component: {
    name: 'Dashboard',
    props: {
      title: 'System Metrics',
      panels: [
        { title: 'CPU', value: '45%' },
        { title: 'Memory', value: '2.1GB' },
      ],
    },
    // State is stored right here in the message!
    state: {
      selectedPanel: 0,
      refreshInterval: 5000,
      lastUpdated: '2026-01-11T10:30:00Z',
    },
  },
};
```

**Why This Approach?**

1. **Simplicity** - No separate state tables, just messages
2. **Context** - State is always associated with the message that created it
3. **History** - Messages ARE the history; state changes are new messages
4. **AIGNE-Native** - Uses existing conversation/message storage
5. **Tambo-Inspired** - Proven approach from production generative UI framework

**State Access Pattern:**

```typescript
// AI can read previous component state
const previousMessage = await conversation.getLastMessage({ role: 'assistant', hasComponent: true });
const previousState = previousMessage?.component?.state;

// AI generates new component with updated state
const newMessage = {
  role: 'assistant',
  content: 'Updated dashboard',
  component: {
    name: 'Dashboard',
    props: { ... },
    state: {
      ...previousState,
      selectedPanel: 1, // User changed selection
      lastUpdated: new Date().toISOString(),
    },
  },
};
```

---

## Streaming & Rendering

### Progressive Component Rendering

```typescript
/**
 * Streaming coordinator for progressive component rendering
 */
export class ComponentStreamCoordinator {
  /**
   * Process streaming component props
   * Uses partial JSON parsing similar to Tambo
   */
  async *streamComponentProps(
    stream: AsyncIterable<AgentResponseDelta>,
    component: UIComponent
  ): AsyncGenerator<PartialComponentProps> {
    let accumulatedProps = {};
    let accumulatedJson = "";

    for await (const delta of stream) {
      // Check if this is a UI skill invocation
      if (!delta.toolCall || !delta.toolCall.name.startsWith("ui_")) {
        yield { type: "text", content: delta.text };
        continue;
      }

      // Accumulate JSON
      if (delta.toolCall.arguments) {
        accumulatedJson += delta.toolCall.arguments;

        // Try to parse partial JSON
        try {
          const partialProps = parsePartialJSON(accumulatedJson);

          // Merge with accumulated props
          accumulatedProps = deepMerge(accumulatedProps, partialProps);

          // Validate against schema (lenient mode)
          const validated = component.propsSchema.safeParse(accumulatedProps);

          yield {
            type: "component",
            componentName: delta.toolCall.name.slice(3), // Remove "ui_"
            props: accumulatedProps,
            isComplete: false,
            isValid: validated.success,
            validationErrors: validated.success ? undefined : validated.error.errors
          };
        } catch (e) {
          // Partial JSON parse failed - continue accumulating
        }
      }
    }

    // Final validation
    const finalProps = parsePartialJSON(accumulatedJson);
    const validated = component.propsSchema.safeParse(finalProps);

    if (!validated.success) {
      throw new Error(
        `Component props validation failed: ${validated.error.message}`
      );
    }

    yield {
      type: "component",
      componentName: component.name,
      props: validated.data,
      isComplete: true,
      isValid: true
    };
  }
}

/**
 * Parse partial JSON (similar to Tambo's partial-json)
 */
function parsePartialJSON(json: string): any {
  // Implementation would use a library like partial-json
  // or implement custom partial parsing logic

  // For now, placeholder:
  try {
    return JSON.parse(json);
  } catch (e) {
    // Attempt to close incomplete structures
    let fixed = json;

    // Count open/close braces and brackets
    const openBraces = (fixed.match(/{/g) || []).length;
    const closeBraces = (fixed.match(/}/g) || []).length;
    const openBrackets = (fixed.match(/\[/g) || []).length;
    const closeBrackets = (fixed.match(/]/g) || []).length;

    // Add missing closures
    fixed += '}".repeat(openBraces - closeBraces);
    fixed += ']'.repeat(openBrackets - closeBrackets);

    try {
      return JSON.parse(fixed);
    } catch (e2) {
      // Give up, return empty object
      return {};
    }
  }
}

/**
 * Deep merge objects
 */
function deepMerge(target: any, source: any): any {
  if (!isObject(target) || !isObject(source)) {
    return source;
  }

  const result = { ...target };

  for (const key of Object.keys(source)) {
    if (isObject(source[key])) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}
```

---

## AFS Integration

### No Special Setup Needed!

With the simplified message-based approach, **no special AFS modules are needed**. Component state lives in messages, which are already handled by AIGNE's conversation storage.

```typescript
import { AIGNE } from '@aigne/core';
// For CLI: import { UIAgent } from '@aigne/ui-cli';
// For Web: import { UIAgent } from '@aigne/ui-web';

/**
 * Setup AIGNE with UI capabilities
 * No special AFS configuration needed!
 */
export function setupAIGNEWithUI() {
  const aigne = new AIGNE({
    model: createModel(),
    // AIGNE's standard conversation storage handles everything
  });

  return aigne;
}

/**
 * Component state is automatically persisted in messages
 */
const session = aigne.invoke(uiAgent);

// When AI generates a component, state is included in the message
await session.invoke({
  message: 'Show me a dashboard',
});

// Message stored in conversation:
// {
//   role: 'assistant',
//   content: 'Here is your dashboard',
//   component: {
//     name: 'Dashboard',
//     props: { ... },
//     state: { selectedPanel: 0 }  // <-- Persisted here!
//   }
// }
```

---

## Skill System Extension

### UI Skill Prefix Pattern

AIGNE Generative UI follows Tambo's pattern of prefixing UI components with `ui_`:

- **Regular Skills**: `search_database`, `send_email`, `fetch_weather`
- **UI Skills**: `ui_dashboard`, `ui_chart`, `ui_form`, `ui_table`

This allows the AI model to distinguish between:

1. **Action tools** - Execute operations, return data
2. **UI tools** - Render components, display information

```typescript
/**
 * Example: UI skill for rendering a chart
 */
export const ChartComponent: UIComponent = {
  name: 'Chart',
  description: `Render an interactive chart visualization.
Supports line, bar, pie, and area charts.
Use when user requests data visualization or trends.`,

  propsSchema: z.object({
    type: z.enum(['line', 'bar', 'pie', 'area']),
    title: z.string(),
    data: z.array(
      z.object({
        label: z.string(),
        value: z.number(),
      })
    ),
    xAxis: z.string().optional(),
    yAxis: z.string().optional(),
  }),

  environment: 'universal',

  async render(props, context) {
    // Environment-specific rendering handled by subclasses
    return {
      element: renderChart(props, context.env),
    };
  },
};

// When registered with UIAgent, becomes skill: "ui_Chart"
```

---

## Data Flow

### Complete Interaction Flow

```
┌──────────────┐
│    User      │
└──────┬───────┘
       │ "Show me sales dashboard"
       │
┌──────▼───────────────────────────────────────────────────┐
│  UIAgent                                                  │
│  • Receives user message                                  │
│  • LLM decides to invoke ui_dashboard skill               │
│  • Streams props for dashboard component                  │
└──────┬───────────────────────────────────────────────────┘
       │
       │ Tool Call: ui_dashboard
       │ Streaming Args: { title: "Sales...", panels: [...
       │
┌──────▼───────────────────────────────────────────────────┐
│  ComponentStreamCoordinator                               │
│  • Parses partial JSON as it streams                      │
│  • Validates props against schema                         │
│  • Emits progressive updates                              │
└──────┬───────────────────────────────────────────────────┘
       │
       │ Partial Props Updates
       │
┌──────▼───────────────────────────────────────────────────┐
│  Component Registry                                       │
│  • Looks up "dashboard" component                         │
│  • Creates instance ID                                    │
│  • Initializes component context                          │
└──────┬───────────────────────────────────────────────────┘
       │
       │ Component Context + Props
       │
┌──────▼───────────────────────────────────────────────────┐
│  DashboardComponent                                       │
│  • Renders with current props (progressive)               │
│  • Updates component state via context.state              │
│  • Emits events                                           │
└──────┬───────────────────────────────────────────────────┘
       │
       │ Rendered Element + State Updates
       │
┌──────▼───────────────────────────────────────────────────┐
│  Message Storage                                          │
│  • Stores component + state in message                    │
│  • State persists with the message that created it        │
└──────┬───────────────────────────────────────────────────┘
       │
       │ Message + Component + State Saved
       │
┌──────▼───────────────────────────────────────────────────┐
│  Presentation Layer (CLI/Web)                             │
│  • Displays rendered component                            │
│  • Handles user interactions                              │
│  • Sends state updates back to agent                      │
└───────────────────────────────────────────────────────────┘
```

### State Update Flow

```
User interacts with component
    ↓
Component updates local state
    ↓
ComponentState.set(key, value)
    ↓
On next AI turn, state is included in new message
    ↓
Message saved to conversation:
{
  role: 'assistant',
  component: {
    name: 'Dashboard',
    props: { ... },
    state: { selectedPanel: 1 }  // Updated state
  }
}
    ↓
AI can read previous state from message history
```

---

## Type System

### Core Types

```typescript
// Component Props
export type ComponentProps = Record<string, any>;

// Partial props during streaming
export interface PartialComponentProps {
  type: 'text' | 'component';
  content?: string;
  componentName?: string;
  props?: Partial<ComponentProps>;
  isComplete: boolean;
  isValid: boolean;
  validationErrors?: z.ZodIssue[];
}

// Component instance
export interface ComponentInstance {
  id: string;
  componentName: string;
  props: ComponentProps;
  state: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// UI message (extends AIGNE Message)
export interface UIMessage extends Message {
  // Component info if this message contains UI
  component?: {
    instanceId: string;
    name: string;
    props: ComponentProps;
  };

  // Rendered element (environment-specific)
  renderedElement?: any;
}
```

---

## Error Handling

### Component Error Boundaries

```typescript
/**
 * Component error handler
 */
export class ComponentErrorBoundary {
  async renderSafely(component: UIComponent, props: any, context: ComponentContext): Promise<ComponentOutput> {
    try {
      // Validate props
      const validated = component.propsSchema.parse(props);

      // Render
      return await component.render(validated, context);
    } catch (error) {
      // Log error
      console.error(`Component ${component.name} failed:`, error);

      // Emit error event
      context.events.emit('componentError', {
        componentName: component.name,
        instanceId: context.instanceId,
        error: error.message,
      });

      // Return error component
      return {
        element: this.renderError(component, error, context),
      };
    }
  }

  private renderError(component: UIComponent, error: any, context: ComponentContext): any {
    // Environment-specific error rendering
    if (context.env.type === 'cli') {
      return `❌ Error rendering ${component.name}: ${error.message}`;
    } else {
      return React.createElement(ErrorComponent, {
        componentName: component.name,
        error: error.message,
      });
    }
  }
}
```

### Validation Errors

```typescript
/**
 * Handle prop validation errors gracefully
 */
export function handleValidationError(error: z.ZodError, component: UIComponent): string {
  const issues = error.errors
    .map((issue) => {
      const path = issue.path.join('.');
      return `• ${path}: ${issue.message}`;
    })
    .join('\n');

  return `
Invalid props for component "${component.name}":

${issues}

Expected schema:
${JSON.stringify(component.propsSchema, null, 2)}
`.trim();
}
```

---

## Summary

This architecture design provides:

1. **Clean Separation**: Environment-agnostic core, environment-specific rendering
2. **AIGNE Integration**: Extends existing patterns (skills, AFS, agents)
3. **Type Safety**: Zod schemas throughout
4. **Progressive Rendering**: Streaming with partial JSON parsing
5. **State Persistence**: AFS-based state management
6. **Error Handling**: Graceful degradation and clear error messages
7. **Extensibility**: Easy to add new components and environments

The design is production-ready while maintaining simplicity and developer experience.
