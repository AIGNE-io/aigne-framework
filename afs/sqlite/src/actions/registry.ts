import type { ActionContext, ActionDefinition, ActionHandler, ActionResult } from "./types.js";

/**
 * Registry for managing action handlers
 */
export class ActionsRegistry {
  private handlers = new Map<string, ActionDefinition>();

  /**
   * Registers an action handler
   */
  register(definition: ActionDefinition): void {
    this.handlers.set(definition.name, definition);
  }

  /**
   * Registers a simple action with just name and handler
   */
  registerSimple(
    name: string,
    handler: ActionHandler,
    options?: {
      description?: string;
      tableLevel?: boolean;
      rowLevel?: boolean;
    },
  ): void {
    this.register({
      name,
      handler,
      description: options?.description,
      tableLevel: options?.tableLevel ?? false,
      rowLevel: options?.rowLevel ?? true,
    });
  }

  /**
   * Unregisters an action
   */
  unregister(name: string): boolean {
    return this.handlers.delete(name);
  }

  /**
   * Checks if an action is registered
   */
  has(name: string): boolean {
    return this.handlers.has(name);
  }

  /**
   * Gets an action definition
   */
  get(name: string): ActionDefinition | undefined {
    return this.handlers.get(name);
  }

  /**
   * Lists all registered actions
   */
  list(options?: { tableLevel?: boolean; rowLevel?: boolean }): ActionDefinition[] {
    const actions = Array.from(this.handlers.values());

    if (options?.tableLevel !== undefined || options?.rowLevel !== undefined) {
      return actions.filter((a) => {
        if (options.tableLevel && !a.tableLevel) return false;
        if (options.rowLevel && !a.rowLevel) return false;
        return true;
      });
    }

    return actions;
  }

  /**
   * Lists action names
   */
  listNames(options?: { tableLevel?: boolean; rowLevel?: boolean }): string[] {
    return this.list(options).map((a) => a.name);
  }

  /**
   * Executes an action
   */
  async execute(
    name: string,
    ctx: ActionContext,
    params: Record<string, unknown> = {},
  ): Promise<ActionResult> {
    const definition = this.handlers.get(name);

    if (!definition) {
      return {
        success: false,
        message: `Unknown action: ${name}`,
      };
    }

    // Validate action level
    if (ctx.pk && !definition.rowLevel) {
      return {
        success: false,
        message: `Action '${name}' is not available at row level`,
      };
    }

    if (!ctx.pk && !definition.tableLevel) {
      return {
        success: false,
        message: `Action '${name}' is not available at table level`,
      };
    }

    try {
      return await definition.handler(ctx, params);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
