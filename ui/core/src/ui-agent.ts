import type { AFS } from "@aigne/afs";
import { AIAgent, type AIAgentOptions, type Agent } from "@aigne/core";
import { ComponentRegistry } from "./registry.js";
import type { ComponentEnvironment, UIComponent } from "./types.js";

/**
 * UIAgent options
 * Note: We don't omit hooks - they need to be passed through to AIAgent
 */
export interface UIAgentOptions extends AIAgentOptions {
  /** UI components to register */
  components?: UIComponent[];

  /** Component environment */
  environment: ComponentEnvironment;

  /** AFS for state persistence (required) */
  afs: AFS;

  /** Optional UI-specific instructions */
  uiInstructions?: string;

  /** Other skills (non-UI) - overrides the skills from AIAgentOptions */
  skills?: Agent[];
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

/**
 * UIAgent extends AIAgent with UI generation capabilities
 */
export class UIAgent extends AIAgent {
  private componentRegistry: ComponentRegistry;
  private environment: ComponentEnvironment;
  // Note: afs is inherited from Agent base class

  constructor(options: UIAgentOptions) {
    // Ensure AFS is provided
    if (!options.afs) {
      throw new Error("UIAgent requires AFS to be configured for state persistence");
    }

    // ✅ Store AFS reference for passing to component agents
    const afs = options.afs;

    const componentRegistry = new ComponentRegistry();
    const environment = options.environment;

    // Register provided components
    if (options.components) {
      for (const component of options.components) {
        // Validate environment compatibility
        if (
          component.environment !== "universal" &&
          component.environment !== environment
        ) {
          console.warn(
            `Component ${component.name} is for ${component.environment} ` +
              `but agent is running in ${environment}`
          );
          continue;
        }

        componentRegistry.register(component);
      }
    }

    // ✅ Pass AFS to toAgents for component agent creation
    const uiAgents = componentRegistry.toAgents(afs);

    // Add UI-specific system instructions
    const enhancedInstructions = [
      options.instructions,
      options.uiInstructions || DEFAULT_UI_INSTRUCTIONS,
    ]
      .filter(Boolean)
      .join("\n\n");

    // Call super with merged configuration
    // All hooks are automatically included via spread operator now
    super({
      ...options,
      instructions: enhancedInstructions,
      // Merge UI agents with other skills
      skills: [...(options.skills || []), ...uiAgents],
    });

    this.componentRegistry = componentRegistry;
    this.environment = environment;
    // afs is already set by super() constructor
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
  static forCLI(options: Omit<UIAgentOptions, "environment">): UIAgent {
    return new UIAgent({
      ...options,
      environment: "cli",
    });
  }

  /**
   * Factory method for Web version
   */
  static forWeb(options: Omit<UIAgentOptions, "environment">): UIAgent {
    return new UIAgent({
      ...options,
      environment: "web",
    });
  }
}
