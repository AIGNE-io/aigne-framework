import type { AFS } from "@aigne/afs";
import { type Agent, FunctionAgent } from "@aigne/core";
import { logger } from "@aigne/core/utils/logger.js";
import { z } from "zod";
import type { ComponentContext, ComponentEnvironment, UIComponent } from "./types.js";
import { ComponentState, UI_TOOL_NAME_PREFIX } from "./types.js";

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

    return all.filter(
      (c) => c.environment === environment || c.environment === "universal"
    );
  }

  /**
   * Convert components to AIGNE Agents
   * These agents will have "ui_" prefix and become LLM-callable tools
   * ✅ CORRECTED: Accepts AFS as parameter to pass to component agents
   */
  toAgents(afs: AFS): Agent[] {
    return Array.from(this.components.values()).map((component) =>
      this.componentToAgent(component, afs)
    );
  }

  /**
   * Convert a single component to an AIGNE Agent
   * ✅ Uses 'show_component_' prefix like Tambo for clarity
   */
  private componentToAgent(component: UIComponent, afs: AFS): Agent {
    // Define the process function with proper typing
    const processFunction = async function (this: any, input: any, options: any) {
        logger.debug(`[ComponentRegistry] processFunction START - component: ${component.name}`, { input, options });

        // Access AIGNE context from options
        const context = options.context;
        if (!context) {
          logger.error(`[ComponentRegistry] No context provided to component agent: ${component.name}`);
          throw new Error("No context provided to component agent");
        }
        // ✅ CORRECTED: Get sessionId from context
        const sessionId = context.sessionId;
        logger.debug(`[ComponentRegistry] Context retrieved - sessionId: ${sessionId}`);

        // Generate unique instance ID
        const instanceId = `${component.name}_${Date.now()}`;
        logger.debug(`[ComponentRegistry] Generated instanceId: ${instanceId}`);

        // ✅ CORRECTED: Load state using AFS from closure
        logger.debug(`[ComponentRegistry] Loading component state for ${instanceId}...`);
        const componentState = await ComponentState.load(
          instanceId,
          afs, // ✅ From closure parameter
          sessionId,
          component.stateSchema
        );
        logger.debug(`[ComponentRegistry] Component state loaded:`, componentState.toJSON());

        // Create component context
        const componentContext: ComponentContext = {
          instanceId,
          state: componentState,
          afs, // ✅ Pass AFS from closure
          events: context.events,
          aigneContext: context,
          env: {}, // Environment-specific data can be injected by UIAgent
        };
        logger.debug(`[ComponentRegistry] Component context created for ${component.name}`, componentContext);

        // Call lifecycle hook if defined
        if (component.onMount) {
          logger.debug(`[ComponentRegistry] Calling onMount hook for ${component.name}...`);
          await component.onMount(input, componentContext);
          logger.debug(`[ComponentRegistry] onMount hook completed for ${component.name}`);
        }

        // Render component
        logger.debug(`[ComponentRegistry] Rendering component ${component.name}...`);
        const output = await component.render(input, componentContext);
        logger.debug(`[ComponentRegistry] Component ${component.name} rendered`, {
          hasElement: !!output.element,
          hasStateUpdates: !!output.stateUpdates,
          hasEvents: !!output.events
        });

        // Apply state updates
        if (output.stateUpdates) {
          logger.debug(`[ComponentRegistry] Applying state updates for ${component.name}...`, output.stateUpdates);
          await componentState.update(output.stateUpdates);
          logger.debug(`[ComponentRegistry] State updates applied for ${component.name}`);
        }

        // Emit events
        if (output.events) {
          logger.debug(`[ComponentRegistry] Emitting ${output.events.length} events for ${component.name}...`);
          for (const event of output.events) {
            logger.debug(`[ComponentRegistry] Emitting event: ${event.type}`, event.data);
            context.events.emit(event.type, event.data);
          }
          logger.debug(`[ComponentRegistry] All events emitted for ${component.name}`);
        }

        // ✅ CORRECTED: Store component message in AFSHistory with proper path
        const historyPath = `/modules/history/by-session/${sessionId}/new`;
        logger.debug(`[ComponentRegistry] Writing to AFS history at path: ${historyPath}`);
        await afs.write(historyPath, {
          content: {
            role: "assistant" as const,
            component: {
              name: component.name,
              props: input,
              state: componentState.toJSON(),
            },
          },
          metadata: {
            instanceId,
            componentName: component.name,
            type: "component-render",
            timestamp: new Date().toISOString(),
          },
        });
        logger.debug(`[ComponentRegistry] AFS history write completed for ${component.name}`);

        const result = {
          instanceId,
          componentName: component.name,
          rendered: true,
          element: output.element,
        };
        logger.debug(`[ComponentRegistry] processFunction COMPLETE - component: ${component.name}`, result);

        return result;
    };

    return new FunctionAgent({
      name: `${UI_TOOL_NAME_PREFIX}${component.name}`,
      description: component.description,
      inputSchema: component.propsSchema,
      outputSchema: z.object({
        instanceId: z.string(),
        componentName: z.string(),
        rendered: z.boolean(),
        element: z.any().optional(),
      }),
      process: processFunction,
    });
  }
}
