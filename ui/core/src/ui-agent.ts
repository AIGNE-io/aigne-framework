import type { AFS } from "@aigne/afs";
import { type Agent, AIAgent, type AIAgentOptions } from "@aigne/core";
import { createComponentSkills } from "./skill.js";
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

Your tools are divided into three categories:

1. **UI Component Tools** (prefixed with 'show_component_'):
   - These tools display UI components on the user's screen
   - Examples: 'show_component_chart', 'show_component_table', 'show_component_form'
   - You may call multiple UI tools in sequence if it makes sense to show multiple components to the user
   - Each UI tool call will display a component, and you can continue to call more UI tools after seeing the tool response

2. **Component Query Tools**:
   - 'get_component': Load full data for a previously rendered component by its instance ID
   - 'list_components': List all components rendered in this conversation session
   - Use these to access or modify components from earlier in the conversation

3. **Informational Tools** (all other tools):
   - These tools request data or perform an action
   - Examples: 'get_weather', 'search_documents', 'calculate'
   - All non-UI and non-component-query tools are informational tools

## Tool Calling Pattern

**Sequential, Not Parallel**: You should call tools one at a time, in sequence. Do not attempt to call multiple tools in parallel.

**Common Pattern**:
1. Call informational tools to gather required data
2. Call UI component tools to display the data to the user
3. Respond with a brief confirmation

It is **not required** to call a UI tool after calling an informational tool, but you should call a UI tool if it makes sense to visualize or present the data.

## Component Memory System

**IMPORTANT**: All UI components you create are automatically saved and persist throughout the conversation.

Each component gets a unique instance ID (e.g., 'Table_1736676000000') when rendered.

### When the user asks to modify or reference a previous component:

1. **Use 'list_components' tool** to see all available components in the session
2. **Use 'get_component' tool** to load the specific component's current data
3. **Create a new component** with the modified data using the appropriate 'show_component_*' tool

**Key Points**:
- You DON'T modify components in place - you create new versions
- Always check component history when users reference "that", "the previous", "the earlier" UI
- Component data includes both props (initial data) and state (user interactions)

## UI Component Guidelines

- Each 'show_component_*' tool corresponds to a specific renderable component
- Provide all required props according to the component's schema
- Component state is automatically persisted between interactions
- For complex UIs, you can invoke multiple components sequentially
- When extending or modifying components, always include ALL data (old + new)
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
        if (component.environment !== "universal" && component.environment !== environment) {
          console.warn(
            `Component ${component.name} is for ${component.environment} ` +
              `but agent is running in ${environment}`,
          );
          continue;
        }

        componentRegistry.register(component);
      }
    }

    // ✅ Pass AFS to toAgents for component agent creation
    const uiAgents = componentRegistry.toAgents(afs);

    // ✅ Create component query tools for LLM to access component history
    const { getComponentSkill, listComponentsSkill } = createComponentSkills(afs);

    // Add UI-specific system instructions
    const enhancedInstructions = [options.instructions, DEFAULT_UI_INSTRUCTIONS]
      .filter(Boolean)
      .join("\n\n");

    // Call super with merged configuration
    // All hooks are automatically included via spread operator now
    super({
      ...options,
      instructions: enhancedInstructions,
      // Merge UI agents + component query tools + other skills
      skills: [...(options.skills || []), ...uiAgents, getComponentSkill, listComponentsSkill],
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
