import type { AFS } from "@aigne/afs";
import type { Context } from "@aigne/core";
import type { ZodType } from "zod";
import { logger } from "./utils/logger.js";

/**
 * UI component tool name prefix
 */
export const UI_TOOL_NAME_PREFIX = "show_component_";

/**
 * Environment where the component runs
 */
export type ComponentEnvironment = "cli" | "web" | "universal";

/**
 * Callback invoked after a component is rendered
 * Allows environment-specific rendering logic (e.g., Ink render/unmount for CLI)
 */
export type OnComponentShowCallback = (output: ComponentOutput & { componentId: string }) => void | Promise<void>;

/**
 * Component rendering context
 * Provides access to state, AFS, events, and AIGNE context
 */
export interface ComponentContext {
  /** Unique component ID for this component render */
  componentId: string;

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
    private componentId: string,
    afs: AFS,
    sessionId: string,
    initialState?: Record<string, any>,
    schema?: ZodType,
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
   */
  private async persistState(): Promise<void> {
    const afsPath = `/modules/history/by-component/${this.componentId}/new`;
    await this.afs.write(afsPath, {
      id: this.componentId, // ← Use componentId as stable ID for upsert behavior
      content: {},
      metadata: {
        type: "component-state",
        updatedAt: new Date().toISOString(),
      },
      componentId: this.componentId,
      componentName: "state", // Generic component name for state entries
      props: {},
      state: this.state,
      sessionId: this.sessionId, // ← Add sessionId at top level
    } as any);
    logger.debug(`[ComponentState] State persisted to AFS`, { id: this.componentId, sessionId: this.sessionId });
  }

  /**
   * Load state from AFSHistory via AFS
   */
  static async load(
    componentId: string,
    afs: AFS,
    sessionId: string,
    schema?: ZodType,
  ): Promise<ComponentState> {
    try {
      // Since we use componentId as stable ID, there's only one record per component
      const result = await afs.list(`/modules/history/by-component/${componentId}`, {
        filter: { sessionId },
        limit: 1,
      });

      // Get state from the single record (if it exists)
      const entry = result.data[0] as any;
      const savedState = entry?.state || entry?.content?.state || {};

      return new ComponentState(componentId, afs, sessionId, savedState, schema);
    } catch (error) {
      logger.error(`[ComponentState] Error loading state:`, error);
      // No saved state, return empty
      return new ComponentState(componentId, afs, sessionId, {}, schema);
    }
  }

  /**
   * Returns current state for serialization
   */
  toJSON(): Record<string, any> {
    return { ...this.state };
  }
}
