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

  /** Other skills (non-UI) - overrides the skills from AIAgentOptions */
  skills?: Agent[];
}

/**
 * Default UI instructions for LLM
 * Inspired by Tambo's decision-loop-prompts pattern
 */
const DEFAULT_UI_INSTRUCTIONS = `
## Tool Categories

Your tools are divided into two categories:

1. **UI Component Tools** (prefixed with 'show_component_'):
   - These tools display UI components on the user's screen
   - Examples: 'show_component_chart', 'show_component_table', 'show_component_form'
   - You may call multiple UI tools in sequence if it makes sense to show multiple components to the user
   - Each UI tool call will display a component, and you can continue to call more UI tools after seeing the tool response

2. **Informational Tools** (all other tools):
   - These tools request data or perform an action
   - Examples: 'get_weather', 'search_documents', 'calculate'
   - All non-UI tools are informational tools

## Tool Calling Pattern

**Sequential, Not Parallel**: You should call tools one at a time, in sequence. Do not attempt to call multiple tools in parallel.

**Common Pattern**:
1. Call informational tools to gather required data
2. Call UI component tools to display the data to the user
3. Respond with a brief confirmation

**Example Flow**:
\`\`\`
User: "Show me the sales data"
→ Step 1: Call 'get_sales' tool (gather data)
→ Step 2: Call 'show_component_chart' tool (display UI component)
→ Step 3: Respond: "I've displayed your sales data as a chart."
\`\`\`

It is **not required** to call a UI tool after calling an informational tool, but you should call a UI tool if it makes sense to visualize or present the data.

## UI Component Guidelines

- Each 'show_component_*' tool corresponds to a specific renderable component
- Provide all required props according to the component's schema
- Component state is automatically persisted between interactions
- For complex UIs, you can invoke multiple components sequentially
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
      DEFAULT_UI_INSTRUCTIONS,
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
