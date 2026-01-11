import type { AFS } from "@aigne/afs";
import { type Agent, FunctionAgent } from "@aigne/core";
import { z } from "zod";
import type { ComponentContext, ComponentEnvironment, UIComponent } from "./types.js";
import { ComponentState } from "./types.js";

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
   * ✅ CORRECTED: Pass AFS via parameter, capture in closure for agent process
   */
  private componentToAgent(component: UIComponent, afs: AFS): Agent {
    // Define the process function with proper typing
    const processFunction = async function (this: any, input: any, options: any) {
        // Access AIGNE context from options
        const context = options.context;
        if (!context) {
          throw new Error("No context provided to component agent");
        }
        // ✅ CORRECTED: Get sessionId from context
        const sessionId = context.sessionId;

        // Generate unique instance ID
        const instanceId = `${component.name}_${Date.now()}`;

        // ✅ CORRECTED: Load state using AFS from closure
        const componentState = await ComponentState.load(
          instanceId,
          afs, // ✅ From closure parameter
          sessionId,
          component.stateSchema
        );

        // Create component context
        const componentContext: ComponentContext = {
          instanceId,
          state: componentState,
          afs, // ✅ Pass AFS from closure
          events: context.events,
          aigneContext: context,
          env: {}, // Environment-specific data can be injected by UIAgent
        };

        // Call lifecycle hook if defined
        if (component.onMount) {
          await component.onMount(input, componentContext);
        }

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

        return {
          instanceId,
          componentName: component.name,
          rendered: true,
          element: output.element,
        };
    };

    return new FunctionAgent({
      name: `ui_${component.name}`,
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
