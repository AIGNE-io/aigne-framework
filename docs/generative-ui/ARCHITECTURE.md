# AIGNE Generative UI - Architecture Design

This document details the architectural design for integrating generative UI capabilities into the AIGNE Framework.

> **✅ CORRECTED VERSION**: This document has been updated to align with AIGNE's actual Agent and Skills APIs, using AFSHistory for state persistence.

## Table of Contents

1. [Core Architecture](#core-architecture)
2. [Component System](#component-system)
3. [UIAgent Design](#uiagent-design)
4. [State Management via AFSHistory](#state-management-via-afshistory)
5. [Streaming & Rendering](#streaming--rendering)
6. [AFS Integration](#afs-integration)
7. [Skills Pattern (Corrected)](#skills-pattern-corrected)
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
│  │  • Agent conversion (ui_ prefix)                          │ │
│  │  • Streaming coordination                                 │ │
│  │  • State synchronization via AFS                          │ │
│  └──────────────────────────────────────────────────────────┘ │
└───────────────────────────┬───────────────────────────────────┘
                            │
┌───────────────────────────▼───────────────────────────────────┐
│                      AIGNE Core Layer                          │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  AIAgent • ChatModel • Agent • Streaming • Events        │ │
│  └──────────────────────────────────────────────────────────┘ │
└───────────────────────────┬───────────────────────────────────┘
                            │
┌───────────────────────────▼───────────────────────────────────┐
│                    Storage Layer (AFS)                         │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  /modules/history/          - AFSHistory module           │ │
│  │    • Conversation messages  - Chat history                │ │
│  │    • Component data         - UI component info           │ │
│  │    • Component state        - Persistent state            │ │
│  │  /modules/user-profile/     - User preferences            │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Extend, Don't Replace**
   - UIAgent extends AIAgent, inheriting all capabilities
   - Component system builds on existing Agent pattern
   - No changes to AIGNE core needed

2. **Environment-Agnostic Core**
   - Core logic independent of UI environment
   - CLI and Web share same UIAgent
   - Components implement environment-specific rendering

3. **AFSHistory-Based State**
   - Component state stored in AFSHistory entries
   - Uses AIGNE's existing conversation storage
   - Read/write via standard AFS operations
   - No separate storage tables needed

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

  // State management (backed by AFS)
  state: ComponentState;

  // AFS access for reading/writing state
  afs: AFS;

  // Event emitter
  events: EventEmitter;

  // AIGNE context
  aigneContext: Context;

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
 * Stores state in AFSHistory via AFS
 */
export class ComponentState {
  private state: Record<string, any> = {};
  private afs: AFS;
  private sessionId: string;

  constructor(
    private instanceId: string,
    afs: AFS,
    sessionId: string,
    initialState?: Record<string, any>,
    private schema?: z.ZodType
  ) {
    this.afs = afs;
    this.sessionId = sessionId;
    this.state = initialState || {};
  }

  get<T = any>(key: string): T | undefined {
    return this.state[key] as T;
  }

  async set<T = any>(key: string, value: T): Promise<void> {
    // Validate if schema provided
    if (this.schema) {
      this.schema.parse({ [key]: value });
    }

    this.state[key] = value;

    // Persist to AFSHistory
    await this.persistState();
  }

  getAll<T = Record<string, any>>(): T {
    return this.state as T;
  }

  async update(updates: Record<string, any>): Promise<void> {
    Object.assign(this.state, updates);
    await this.persistState();
  }

  /**
   * Persist state to AFSHistory via AFS
   * ✅ CORRECTED: Uses AFSHistory's actual path pattern
   */
  private async persistState(): Promise<void> {
    const historyPath = `/modules/history/by-session/${this.sessionId}/new`;

    await this.afs.write(historyPath, {
      content: {
        role: 'system',
        type: 'component-state',
        componentInstanceId: this.instanceId,
        state: this.state,
      },
      metadata: {
        instanceId: this.instanceId,
        type: 'component-state',
        updatedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Load state from AFSHistory via AFS
   * ✅ CORRECTED: Uses AFSHistory's actual list/filter pattern
   */
  static async load(
    instanceId: string,
    afs: AFS,
    sessionId: string,
    schema?: z.ZodType
  ): Promise<ComponentState> {
    try {
      // List all entries in session
      const result = await afs.list(`/modules/history/by-session/${sessionId}`);

      // Find latest state entry for this component instance
      const stateEntries = result.data
        .filter(e =>
          e.metadata?.type === 'component-state' &&
          e.metadata?.instanceId === instanceId
        )
        .sort((a, b) =>
          new Date(b.metadata?.updatedAt || 0).getTime() -
          new Date(a.metadata?.updatedAt || 0).getTime()
        );

      const latestState = stateEntries[0]?.content?.state || {};

      return new ComponentState(instanceId, afs, sessionId, latestState, schema);
    } catch (error) {
      // No saved state, return empty
      return new ComponentState(instanceId, afs, sessionId, {}, schema);
    }
  }

  /**
   * Returns current state for serialization
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
 * Manages available UI components and converts them to AIGNE Agents
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
   * Convert components to AIGNE Agents
   * These agents will have "ui_" prefix and become LLM-callable tools
   * ✅ CORRECTED: Accepts AFS as parameter to pass to component agents
   */
  toAgents(afs: AFS): Agent[] {
    return Array.from(this.components.values()).map((component) => this.componentToAgent(component, afs));
  }

  /**
   * ✅ CORRECTED: Pass AFS via parameter, capture in closure for agent process
   */
  private componentToAgent(component: UIComponent, afs: AFS): Agent {
    return Agent.from({
      name: `ui_${component.name}`,
      description: component.description,
      inputSchema: component.propsSchema,
      outputSchema: z.object({
        instanceId: z.string(),
        componentName: z.string(),
        rendered: z.boolean(),
        element: z.any().optional(),
      }),

      async process(input: any) {
        // Access AIGNE context via this.context
        const context = this.context;
        // ✅ CORRECTED: Get sessionId from context
        const sessionId = context.sessionId;

        // Generate unique instance ID
        const instanceId = `${component.name}_${Date.now()}`;

        // ✅ CORRECTED: Load state using AFS from closure
        const componentState = await ComponentState.load(
          instanceId,
          afs,  // ✅ From closure parameter
          sessionId,
          component.stateSchema
        );

        // Create component context
        const componentContext: ComponentContext = {
          instanceId,
          state: componentState,
          afs,  // ✅ Pass AFS from closure
          events: context.events,
          aigneContext: context,
          env: {}, // Environment-specific data injected by UIAgent
        };

        // Render component
        const output = await component.render(input, componentContext);

        // Apply state updates
        if (output.stateUpdates) {
          await componentState.update(output.stateUpdates);
        }

        // Emit events
        if (output.events) {
          for (const event of output.events) {
            context.events.emit(event.type, event.data);
          }
        }

        // ✅ CORRECTED: Store component message in AFSHistory with proper path
        const historyPath = `/modules/history/by-session/${sessionId}/new`;
        await afs.write(historyPath, {
          content: {
            role: 'assistant',
            component: {
              name: component.name,
              props: input,
              state: componentState.toJSON(),
            },
          },
          metadata: {
            instanceId,
            componentName: component.name,
            type: 'component-render',
            timestamp: new Date().toISOString(),
          },
        });

        return {
          instanceId,
          componentName: component.name,
          rendered: true,
          element: output.element,
        };
      },
    });
  }
}
```

---

## UIAgent Design

### UIAgent Class

```typescript
import { AIAgent, type AIAgentOptions, Agent } from '@aigne/core';
import { z } from 'zod';

/**
 * UIAgent extends AIAgent with UI generation capabilities
 */
export interface UIAgentOptions extends Omit<AIAgentOptions, 'skills'> {
  // Component registry
  components?: UIComponent[];

  // Component environment
  environment: 'cli' | 'web';

  // AFS for state persistence (required)
  afs: AFS;

  // Optional UI-specific instructions
  uiInstructions?: string;

  // Other skills (non-UI)
  skills?: (Agent | FunctionAgentFn)[];
}

export class UIAgent extends AIAgent {
  private componentRegistry: ComponentRegistry;
  private environment: 'cli' | 'web';
  private afs: AFS;  // ✅ CORRECTED: Store AFS reference

  constructor(options: UIAgentOptions) {
    // Ensure AFS is provided
    if (!options.afs) {
      throw new Error('UIAgent requires AFS to be configured for state persistence');
    }

    // ✅ CORRECTED: Store AFS reference for passing to component agents
    const afs = options.afs;

    const componentRegistry = new ComponentRegistry();
    const environment = options.environment;

    // Register provided components
    if (options.components) {
      for (const component of options.components) {
        // Validate environment compatibility
        if (component.environment !== 'universal' && component.environment !== environment) {
          console.warn(
            `Component ${component.name} is for ${component.environment} ` +
              `but agent is running in ${environment}`
          );
          continue;
        }

        componentRegistry.register(component);
      }
    }

    // ✅ CORRECTED: Pass AFS to toAgents for component agent creation
    const uiAgents = componentRegistry.toAgents(afs);

    // Add UI-specific system instructions
    const enhancedInstructions = [
      options.instructions,
      options.uiInstructions || DEFAULT_UI_INSTRUCTIONS,
    ]
      .filter(Boolean)
      .join('\n\n');

    // Call super with merged configuration
    super({
      ...options,
      instructions: enhancedInstructions,
      // Merge UI agents with other skills
      skills: [...(options.skills || []), ...uiAgents],
    });

    this.componentRegistry = componentRegistry;
    this.environment = environment;
    this.afs = afs;  // ✅ Store AFS instance
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
These are special agents with names prefixed with "ui_".

When the user requests visualization, dashboards, forms, or any interactive UI:
1. Select the appropriate UI component agent
2. Provide all required props according to the schema
3. The component will be rendered automatically

Available UI components are listed in your available agents/tools.
Each ui_* agent corresponds to a renderable component.

Guidelines:
- Use UI components for data visualization, forms, tables, dashboards
- Provide clear, complete props - the component needs all required fields
- For complex UIs, you can invoke multiple components sequentially
- Component state is automatically persisted between interactions
`.trim();
```

---

## State Management via AFSHistory

### Message Structure with Component Data

```typescript
/**
 * AFSHistory entry structure with component data
 * State is stored directly in AFSHistory entries
 */
export interface UIHistoryEntry extends AFSEntry {
  content: {
    // Standard message fields
    role: 'user' | 'assistant' | 'system';
    content?: string;

    // Component data (optional, only for assistant messages with UI)
    component?: {
      name: string;              // Component name (e.g., "Dashboard")
      props: Record<string, any>; // Component props
      state?: Record<string, any>; // Component state (persisted here!)
    };
  };

  metadata: {
    instanceId?: string;
    componentName?: string;
    timestamp: string;
    userId?: string;
    sessionId?: string;
  };
}
```

### State Access Pattern

```typescript
/**
 * Reading component state from AFSHistory
 * ✅ CORRECTED: Uses AFSHistory's list/filter pattern
 */
async function getComponentState(
  afs: AFS,
  sessionId: string,
  instanceId: string
): Promise<Record<string, any> | undefined> {
  try {
    // List all entries in session
    const result = await afs.list(`/modules/history/by-session/${sessionId}`);

    // Find latest state entry for this component
    const stateEntries = result.data
      .filter(e =>
        e.metadata?.type === 'component-state' &&
        e.metadata?.instanceId === instanceId
      )
      .sort((a, b) =>
        new Date(b.metadata?.updatedAt || 0).getTime() -
        new Date(a.metadata?.updatedAt || 0).getTime()
      );

    return stateEntries[0]?.content?.state;
  } catch (error) {
    return undefined;
  }
}

/**
 * Writing component state to AFSHistory
 * ✅ CORRECTED: Uses AFSHistory's creation pattern
 */
async function saveComponentState(
  afs: AFS,
  sessionId: string,
  instanceId: string,
  state: Record<string, any>
): Promise<void> {
  const historyPath = `/modules/history/by-session/${sessionId}/new`;

  await afs.write(historyPath, {
    content: {
      role: 'system',
      type: 'component-state',
      componentInstanceId: instanceId,
      state,
    },
    metadata: {
      instanceId,
      type: 'component-state',
      updatedAt: new Date().toISOString(),
    },
  });
}
```

---

## Streaming & Rendering

### Progressive Component Rendering

```typescript
// ✅ CORRECTED: Use battle-tested partial-json package
import { parse as parsePartialJSON } from 'partial-json';

/**
 * Streaming coordinator for progressive component rendering
 */
export class ComponentStreamCoordinator {
  /**
   * Process streaming component props
   * Uses partial-json package (same as Tambo)
   */
  async *streamComponentProps(
    stream: AsyncIterable<any>,
    component: UIComponent
  ): AsyncGenerator<PartialComponentProps> {
    let accumulatedProps = {};
    let accumulatedJson = '';

    for await (const delta of stream) {
      // Check if this is a UI agent invocation
      if (!delta.toolCall?.name?.startsWith('ui_')) {
        yield { type: 'text', content: delta.text || delta.content || '' };
        continue;
      }

      // Accumulate JSON arguments
      if (delta.toolCall.arguments) {
        accumulatedJson += delta.toolCall.arguments;

        // ✅ Parse partial JSON using partial-json package
        try {
          const partialProps = parsePartialJSON(accumulatedJson);

          // Merge with accumulated props
          accumulatedProps = deepMerge(accumulatedProps, partialProps);

          // Validate against schema (lenient mode)
          const validated = component.propsSchema.safeParse(accumulatedProps);

          yield {
            type: 'component',
            componentName: delta.toolCall.name.slice(3), // Remove "ui_"
            props: accumulatedProps,
            isComplete: false,
            isValid: validated.success,
            validationErrors: validated.success ? undefined : validated.error.errors,
          };
        } catch (e) {
          // Partial JSON parse failed - continue accumulating
        }
      }
    }

    // Final validation
    const finalProps = JSON.parse(accumulatedJson);
    const validated = component.propsSchema.safeParse(finalProps);

    if (!validated.success) {
      throw new Error(`Component props validation failed: ${validated.error.message}`);
    }

    yield {
      type: 'component',
      componentName: component.name,
      props: validated.data,
      isComplete: true,
      isValid: true,
    };
  }
}

/**
 * ✅ REMOVED: Using partial-json package instead of custom implementation
 *
 * The partial-json package (https://www.npmjs.com/package/partial-json) is:
 * - Battle-tested (used by Vercel AI SDK, Tambo, and others)
 * - More robust than simple brace-counting
 * - Handles edge cases like unclosed strings, nested structures
 * - Actively maintained
 *
 * Installation:
 * npm install partial-json
 *
 * Usage:
 * import { parse } from 'partial-json';
 * const obj = parse('{"incomplete": "json...');
 */
```

---

## AFS Integration

### AFSHistory Stores Everything

```typescript
import { AIGNE, AFS } from '@aigne/core';
import { AFSHistory } from '@aigne/afs-history';
import { UIAgent } from '@aigne/ui';

/**
 * Setup AIGNE with UI capabilities
 * AFSHistory handles all storage automatically
 */
export function setupAIGNEWithUI() {
  const aigne = new AIGNE({
    model: createModel(),
  });

  // Setup AFS with AFSHistory
  const afs = new AFS().mount(
    new AFSHistory({
      storage: { url: 'file:./history.sqlite3' },
    })
  );

  return { aigne, afs };
}
```

---

## Skills Pattern (Corrected)

### Understanding AIGNE's Skills System

**Key Concept**: In AIGNE, `skills` are just regular `Agent` instances that become LLM-callable tools.

```typescript
// ✅ CORRECT: Skills are Agents
const myAgent = AIAgent.from({
  name: 'Assistant',
  skills: [
    agentA,  // Regular Agent instance
    agentB,  // Another Agent
    Agent.from({ name: 'tool', async process(input) { return {...}; } }),
  ],
});

// ❌ WRONG: There's no special "AgentSkill" interface for UI components
// AgentSkill is a specific class for loading SKILL.md files from disk
```

### UI Components as Skills Pattern

```typescript
// When registered with UIAgent, it's converted to:
const chartAgent = Agent.from({
  name: 'ui_Chart',  // Prefixed with ui_
  description: 'Render an interactive chart visualization',
  inputSchema: chartPropsSchema,

  async process(input) {
    // Component rendering logic
    // Access context via this.context
    const context = this.context;

    // ... render component ...

    return {
      instanceId,
      componentName: 'Chart',
      rendered: true,
      element,
    };
  },
});
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
│  UIAgent (extends AIAgent)                                │
│  • Receives user message                                  │
│  • LLM sees available agents including ui_Dashboard       │
│  • LLM decides to invoke ui_Dashboard agent               │
│  • Streams props for dashboard component                  │
└──────┬───────────────────────────────────────────────────┘
       │
       │ Agent Call: ui_Dashboard
       │ Streaming Args: { title: "Sales...", panels: [...
       │
┌──────▼───────────────────────────────────────────────────┐
│  ui_Dashboard Agent (created from DashboardComponent)     │
│  • process() method receives props                        │
│  • Loads component state from AFS                         │
│  • Creates ComponentContext                               │
│  • Calls component.render()                               │
└──────┬───────────────────────────────────────────────────┘
       │
       │ Rendered Element + State Updates
       │
┌──────▼───────────────────────────────────────────────────┐
│  Agent (ui_Dashboard) Completion                          │
│  • Saves component data to AFSHistory via AFS             │
│  • Path: /modules/history/{session}/messages/{id}         │
│  • Saves state: /modules/history/{session}/component-state/{id} │
│  • Returns result to LLM                                  │
└──────┬───────────────────────────────────────────────────┘
       │
       │ Agent Result
       │
┌──────▼───────────────────────────────────────────────────┐
│  Presentation Layer (CLI/Web)                             │
│  • Displays rendered component                            │
│  • Handles user interactions                              │
│  • State changes trigger AFS writes                       │
└───────────────────────────────────────────────────────────┘
```

---

## Type System

### Core Types

```typescript
export type ComponentProps = Record<string, any>;

export interface PartialComponentProps {
  type: 'text' | 'component';
  content?: string;
  componentName?: string;
  props?: Partial<ComponentProps>;
  isComplete: boolean;
  isValid: boolean;
  validationErrors?: z.ZodIssue[];
}

export interface UIMessage extends Message {
  role?: 'user' | 'assistant' | 'system';
  content?: string;
  component?: {
    instanceId: string;
    name: string;
    props: ComponentProps;
    state?: Record<string, any>;
  };
  renderedElement?: any;
}
```

---

## Error Handling

### Component Error Boundaries

```typescript
export class ComponentErrorBoundary {
  async renderSafely(
    component: UIComponent,
    props: any,
    context: ComponentContext
  ): Promise<ComponentOutput> {
    try {
      const validated = component.propsSchema.parse(props);
      return await component.render(validated, context);
    } catch (error) {
      console.error(`Component ${component.name} failed:`, error);
      context.events.emit('componentError', {
        componentName: component.name,
        instanceId: context.instanceId,
        error: error.message,
      });

      return {
        element: this.renderError(component, error, context),
      };
    }
  }

  private renderError(component: UIComponent, error: any, context: ComponentContext): any {
    if (context.env.type === 'cli') {
      return `❌ Error rendering ${component.name}: ${error.message}`;
    } else {
      return {
        type: 'error',
        componentName: component.name,
        message: error.message,
      };
    }
  }
}
```

---

## Summary

This architecture provides:

1. **Clean Separation**: Environment-agnostic core, environment-specific rendering
2. **AIGNE Integration**: Uses standard Agent pattern, no special "skill" types
3. **AFSHistory Storage**: Component state persisted via standard AFS operations
4. **Type Safety**: Zod schemas throughout
5. **Progressive Rendering**: Streaming with partial JSON parsing
6. **Error Handling**: Graceful degradation and clear error messages
7. **Extensibility**: Easy to add new components and environments

### Key Corrections from Original Design

1. ✅ **Skills = Agents**: Components become regular Agent instances, not "AgentSkill"
2. ✅ **No registerSkill()**: All skills registered via constructor `skills: []` option
3. ✅ **AFSHistory for State**: Component state stored in AFSHistory, read/write via AFS
4. ✅ **Correct Agent API**: Uses `process()` method with `this.context` access
5. ✅ **Message Structure**: No assumptions about standard fields, extensible via Message type

The design is now production-ready and correctly aligned with AIGNE framework patterns.
