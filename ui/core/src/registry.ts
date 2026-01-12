import type { AFS } from '@aigne/afs';
import { type Agent, FunctionAgent } from '@aigne/core';
import { z } from 'zod';
import type { ComponentContext, ComponentEnvironment, UIComponent } from './types.js';
import { ComponentState, UI_TOOL_NAME_PREFIX } from './types.js';
import { logger } from './utils/logger.js';

/**
 * Component registry
 * Manages available UI components and converts them to AIGNE Agents
 */
export class ComponentRegistry {
  private components = new Map<string, UIComponent>();

  /**
   * Register a component
   */
  register(component: UIComponent): void {
    this.components.set(component.name, component);
  }

  /**
   * Get a component by name
   */
  get(name: string): UIComponent | undefined {
    return this.components.get(name);
  }

  /**
   * List all components, optionally filtered by environment
   */
  list(environment?: ComponentEnvironment): UIComponent[] {
    const all = Array.from(this.components.values());
    if (!environment) return all;

    return all.filter((c) => c.environment === environment || c.environment === 'universal');
  }

  /**
   * Convert components to AIGNE Agents
   * These agents will have "ui_" prefix and become LLM-callable tools
   */
  toAgents(afs: AFS, onComponentShow?: import('./types.js').OnComponentShowCallback): Agent[] {
    return Array.from(this.components.values()).map((component) =>
      this.componentToAgent(component, afs, onComponentShow)
    );
  }

  /**
   * Convert a single component to an AIGNE Agent
   */
  private componentToAgent(
    component: UIComponent,
    afs: AFS,
    onComponentShow?: import('./types.js').OnComponentShowCallback
  ): Agent {
    // Define the process function with proper typing
    const processFunction = async function (this: any, input: any, options: any) {
      logger.debug(`[ComponentRegistry] processFunction START - component: ${component.name}`, {
        input,
      });

      // Access AIGNE context from options
      const context = options.context;
      if (!context) {
        logger.error(`[ComponentRegistry] No context provided to component agent: ${component.name}`);
        throw new Error('No context provided to component agent');
      }
      const sessionId = context.sessionId;
      logger.debug(`[ComponentRegistry] Context retrieved - sessionId: ${sessionId}`);

      // Generate unique component ID
      const componentId = `${component.name}_${Date.now()}`;
      logger.debug(`[ComponentRegistry] Generated componentId: ${componentId}`);

      const componentState = await ComponentState.load(componentId, afs, sessionId, component.stateSchema);
      logger.debug(`[ComponentRegistry] Component state loaded:`, componentState.toJSON());

      // Create component context
      const componentContext: ComponentContext = {
        componentId,
        state: componentState,
        afs,
        events: context.events,
        aigneContext: context,
        env: {},
      };

      // Call lifecycle hook if defined
      if (component.onMount) {
        await component.onMount(input, componentContext);
        logger.debug(`[ComponentRegistry] onMount hook completed for ${component.name}`);
      }

      // Render component
      const output = await component.render(input, componentContext);
      logger.debug(`[ComponentRegistry] Component ${component.name} rendered`, {
        hasElement: !!output.element,
        hasStateUpdates: !!output.stateUpdates,
        hasEvents: !!output.events,
      });
      // Call onComponentShow callback if provided (for environment-specific rendering)
      if (onComponentShow) {
        await onComponentShow({
          ...output,
          componentId,
        });
      }

      // Apply state updates
      if (output.stateUpdates) {
        await componentState.update(output.stateUpdates);
        logger.debug(`[ComponentRegistry] State updates applied for ${component.name}`, output.stateUpdates);
      }

      // Emit events
      if (output.events) {
        for (const event of output.events) {
          logger.debug(`[ComponentRegistry] Emitting event: ${event.type}`, event.data);
          context.events.emit(event.type, event.data);
        }
      }

      // Use componentId as stable ID so updates replace the record instead of creating new ones
      const afsPath = `/modules/history/by-component/${componentId}/new`;
      logger.debug(`[ComponentRegistry] Writing to AFS history at path: ${afsPath}`);
      await afs.write(afsPath, {
        id: componentId, // ← Stable ID for upsert behavior
        sessionId, // ← Add sessionId at top level (required by AFSHistory write validation)
        content: {},
        metadata: {
          type: 'component-render',
          timestamp: new Date().toISOString(),
        },
        componentId: componentId, // ← Required for by-component scope
        componentName: component.name,
        props: input,
        state: componentState.toJSON(),
      } as any);
      logger.debug(`[ComponentRegistry] AFS history write completed for ${component.name}`);

      // Create result with element stored separately to avoid serialization issues
      // React/Ink elements contain Symbols that can't be JSON-serialized
      const result: any = {
        componentId,
        componentName: component.name,
        rendered: true,
      };

      return result;
    };

    return new FunctionAgent({
      name: `${UI_TOOL_NAME_PREFIX}${component.name}`,
      description: component.description,
      inputSchema: component.propsSchema,
      outputSchema: z.object({
        componentId: z.string(),
        componentName: z.string(),
        rendered: z.boolean(),
        element: z.any().optional(),
      }),
      process: processFunction,
    });
  }
}
