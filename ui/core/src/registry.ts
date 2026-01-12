import type { AFS } from "@aigne/afs";
import { type Agent, FunctionAgent } from "@aigne/core";
import { z } from "zod";
import type { ComponentContext, ComponentEnvironment, UIComponent } from "./types.js";
import { ComponentState, UI_TOOL_NAME_PREFIX } from "./types.js";
import { logger } from "./utils/logger.js";

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

    return all.filter((c) => c.environment === environment || c.environment === "universal");
  }

  /**
   * Convert components to AIGNE Agents
   * These agents will have "ui_" prefix and become LLM-callable tools
   * ✅ CORRECTED: Accepts AFS as parameter to pass to component agents
   */
  toAgents(afs: AFS): Agent[] {
    return Array.from(this.components.values()).map((component) =>
      this.componentToAgent(component, afs),
    );
  }

  /**
   * Convert a single component to an AIGNE Agent
   * ✅ Uses 'show_component_' prefix like Tambo for clarity
   */
  private componentToAgent(component: UIComponent, afs: AFS): Agent {
    // Define the process function with proper typing
    const processFunction = async function (this: any, input: any, options: any) {
      logger.debug(`[ComponentRegistry] processFunction START - component: ${component.name}`, {
        input,
      });

      // Access AIGNE context from options
      const context = options.context;
      if (!context) {
        logger.error(
          `[ComponentRegistry] No context provided to component agent: ${component.name}`,
        );
        throw new Error("No context provided to component agent");
      }
      // ✅ CORRECTED: Get sessionId from context
      const sessionId = context.sessionId;
      logger.debug(`[ComponentRegistry] Context retrieved - sessionId: ${sessionId}`);

      // Generate unique component ID
      const componentId = `${component.name}_${Date.now()}`;
      logger.debug(`[ComponentRegistry] Generated componentId: ${componentId}`);

      // ✅ CORRECTED: Load state using AFS from closure
      const componentState = await ComponentState.load(
        componentId,
        afs, // ✅ From closure parameter
        sessionId,
        component.stateSchema,
      );
      logger.debug(`[ComponentRegistry] Component state loaded:`, componentState.toJSON());

      // Create component context
      const componentContext: ComponentContext = {
        componentId,
        state: componentState,
        afs, // ✅ Pass AFS from closure
        events: context.events,
        aigneContext: context,
        env: {}, // Environment-specific data can be injected by UIAgent
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

      // Apply state updates
      if (output.stateUpdates) {
        await componentState.update(output.stateUpdates);
        logger.debug(
          `[ComponentRegistry] State updates applied for ${component.name}`,
          output.stateUpdates,
        );
      }

      // Emit events
      if (output.events) {
        for (const event of output.events) {
          logger.debug(`[ComponentRegistry] Emitting event: ${event.type}`, event.data);
          context.events.emit(event.type, event.data);
        }
      }

      // ✅ CORRECTED: Store component message in AFSHistory with proper path
      // Use componentId as stable ID so updates replace the record instead of creating new ones
      const historyPath = `/modules/history/by-component/${componentId}/new`;
      logger.debug(`[ComponentRegistry] Writing to AFS history at path: ${historyPath}`);
      await afs.write(historyPath, {
        id: componentId, // ← Stable ID for upsert behavior
        content: {
          role: "assistant" as const,
          component: {
            name: component.name,
            props: input,
            state: componentState.toJSON(),
          },
        },
        metadata: {
          componentId,
          componentName: component.name,
          type: "component-render",
          timestamp: new Date().toISOString(),
        },
        componentId: componentId, // ← Required for by-component scope
        componentName: component.name,
        props: input,
        state: componentState.toJSON(),
        sessionId, // ← Add sessionId at top level (required by AFSHistory write validation)
      } as any);
      logger.debug(`[ComponentRegistry] AFS history write completed for ${component.name}`);

      const result = {
        componentId,
        componentName: component.name,
        rendered: true,
        element: output.element,
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
