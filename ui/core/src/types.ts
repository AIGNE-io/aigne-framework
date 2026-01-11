import type { AFS } from "@aigne/afs";
import type { Context } from "@aigne/core";
import type { ZodType } from "zod";

/**
 * UI component tool name prefix
 * Following Tambo's convention for clarity
 */
export const UI_TOOL_NAME_PREFIX = "show_component_";

/**
 * Environment where the component runs
 */
export type ComponentEnvironment = "cli" | "web" | "universal";

/**
 * Component rendering context
 * Provides access to state, AFS, events, and AIGNE context
 */
export interface ComponentContext {
  /** Unique instance ID for this component render */
  instanceId: string;

  /** Component state manager (backed by AFS) */
  state: ComponentState;

  /** AFS instance for storage operations */
  afs: AFS;

  /** Event emitter from AIGNE context */
  events: any;

  /** AIGNE context for advanced operations */
  aigneContext: Context;

  /** Environment-specific data */
  env: Record<string, any>;
}

/**
 * Component output from render
 */
export interface ComponentOutput {
  /** Rendered element (environment-specific, should be serializable) */
  element: any;

  /** Updates to component state */
  stateUpdates?: Record<string, any>;

  /** Events to emit */
  events?: Array<{ type: string; data: any }>;
}

/**
 * Base UI component definition
 * Environment-agnostic interface
 */
export interface UIComponent<TProps = any> {
  /** Component name (will be prefixed with ui_ when registered as skill) */
  name: string;

  /** Description for AI to understand when to use this component */
  description: string;

  /** Zod schema for component props */
  propsSchema: ZodType<TProps>;

  /** Render function that produces component output */
  render: (props: TProps, context: ComponentContext) => Promise<ComponentOutput>;

  /** Optional lifecycle hooks */
  onMount?: (props: TProps, context: ComponentContext) => void | Promise<void>;
  onUpdate?: (props: TProps, context: ComponentContext) => void | Promise<void>;
  onUnmount?: (context: ComponentContext) => void | Promise<void>;

  /** Optional state schema for validation */
  stateSchema?: ZodType;

  /** Environment this component is designed for */
  environment: ComponentEnvironment;
}

/**
 * Component state manager
 * Stores state in AFSHistory via AFS
 */
export class ComponentState {
  private state: Record<string, any> = {};
  private afs: AFS;
  private sessionId: string;
  private schema?: ZodType;

  constructor(
    private instanceId: string,
    afs: AFS,
    sessionId: string,
    initialState?: Record<string, any>,
    schema?: ZodType
  ) {
    this.afs = afs;
    this.sessionId = sessionId;
    this.state = initialState || {};
    this.schema = schema;
  }

  /**
   * Get a value from state
   */
  get<T = any>(key: string): T | undefined {
    return this.state[key] as T;
  }

  /**
   * Set a value in state and persist
   */
  async set<T = any>(key: string, value: T): Promise<void> {
    // Validate if schema provided
    if (this.schema) {
      this.schema.parse({ [key]: value });
    }

    this.state[key] = value;
    await this.persistState();
  }

  /**
   * Get all state
   */
  getAll<T = Record<string, any>>(): T {
    return this.state as T;
  }

  /**
   * Update multiple state values
   */
  async update(updates: Record<string, any>): Promise<void> {
    Object.assign(this.state, updates);
    await this.persistState();
  }

  /**
   * Persist state to AFSHistory via AFS
   * ✅ Uses correct AFSHistory path pattern
   */
  private async persistState(): Promise<void> {
    const historyPath = `/modules/history/by-session/${this.sessionId}/new`;

    await this.afs.write(historyPath, {
      content: {
        role: "system" as const,
        type: "component-state",
        componentInstanceId: this.instanceId,
        state: this.state,
      },
      metadata: {
        instanceId: this.instanceId,
        type: "component-state",
        updatedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Load state from AFSHistory via AFS
   * ✅ Uses correct list/filter pattern
   */
  static async load(
    instanceId: string,
    afs: AFS,
    sessionId: string,
    schema?: ZodType
  ): Promise<ComponentState> {
    try {
      // List all entries in session
      const result = await afs.list(`/modules/history/by-session/${sessionId}`);

      // Find latest state entry for this component instance
      const stateEntries = result.data
        .filter(
          (e: any) =>
            e.metadata?.type === "component-state" &&
            e.metadata?.instanceId === instanceId
        )
        .sort(
          (a: any, b: any) =>
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
