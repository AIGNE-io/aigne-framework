import type { AFS } from "@aigne/afs";
import { FunctionAgent } from "@aigne/core";
import { logger } from "@aigne/core/utils/logger.js";
import { z } from "zod";

/**
 * Create component query skills for LLM to access component history
 */
export function createComponentSkills(afs: AFS) {
  /**
   * get_component skill - Load a specific component by componentId
   */
  const getComponentSkill = new FunctionAgent({
    name: "get_component",
    description:
      "Load full data for a previously rendered UI component by its component ID. " +
      "Use this when you need to see or modify a component from earlier in the conversation. " +
      "The component data includes its name, props, and current state.",
    inputSchema: z.object({
      componentId: z
        .string()
        .describe("The unique component ID of the component (e.g., 'Table_1736676000000')"),
    }),
    outputSchema: z.object({
      found: z.boolean(),
      component: z
        .object({
          componentId: z.string(),
          componentName: z.string(),
          props: z.record(z.any()),
          state: z.record(z.any()),
          sessionId: z.string().optional(),
          createdAt: z.string().optional(),
        })
        .optional(),
      message: z.string().optional(),
    }),

    async process(input, options) {
      const { componentId } = input;
      const context = options.context;

      logger.debug(`[get_component] START - componentId: ${componentId}`);

      try {
        // Read component from AFS
        const afsPath = `/modules/history/by-component/${componentId}`;
        logger.debug(`[get_component] Reading from AFS path: ${afsPath}`);
        const result = await afs.read(afsPath);
        logger.debug(`[get_component] AFS read result:`, {
          hasData: !!result.data,
          dataKeys: result.data ? Object.keys(result.data) : []
        });

        if (!result.data) {
          logger.debug(`[get_component] Component not found: ${componentId}`);
          return {
            found: false,
            message: `Component with ID '${componentId}' not found`,
          };
        }

        const entry = result.data;

        // Component data may be at top level (from components table) or in content.component
        const componentData = entry as any;
        const componentName =
          componentData.componentName ||
          entry.content?.component?.name ||
          entry.metadata?.componentName ||
          "Unknown";
        const props = componentData.props || entry.content?.component?.props || {};
        const state = componentData.state || entry.content?.component?.state || {};

        logger.debug(`[get_component] Component found:`, {
          componentId: entry.id,
          componentName,
          hasProps: Object.keys(props).length > 0,
          hasState: Object.keys(state).length > 0,
          sessionId: entry.sessionId
        });

        return {
          found: true,
          component: {
            componentId: entry.id,
            componentName,
            props,
            state,
            sessionId: entry.sessionId ?? undefined,
            createdAt: entry.createdAt?.toString(),
          },
          message: `Found component: ${componentName}`,
        };
      } catch (error: any) {
        logger.error(`[get_component] Error:`, error);
        return {
          found: false,
          message: `Error loading component: ${error.message}`,
        };
      }
    },
  });

  /**
   * list_components skill - List all components in current session
   */
  const listComponentsSkill = new FunctionAgent({
    name: "list_components",
    description:
      "List all UI components that have been rendered in the current conversation session. " +
      "Returns a summary of each component including its ID, name, and when it was created. " +
      "Use this to see what components are available to reference or modify.",
    inputSchema: z.object({
      limit: z
        .number()
        .optional()
        .default(20)
        .describe("Maximum number of components to return (default: 20)"),
    }),
    outputSchema: z.object({
      components: z.array(
        z.object({
          componentId: z.string(),
          componentName: z.string(),
          createdAt: z.string().optional(),
          summary: z.string().optional(),
        }),
      ),
      count: z.number(),
      message: z.string().optional(),
    }),

    async process(input, options) {
      const { limit = 20 } = input;
      const context = options.context;

      logger.debug(`[list_components] START - limit: ${limit}`);
      logger.debug(`[list_components] Context keys:`, Object.keys(context));
      logger.debug(`[list_components] UserContext:`, context.userContext);

      // sessionId may be in context or context.userContext
      const sessionId = (context as any).sessionId || (context.userContext as any)?.sessionId;
      logger.debug(`[list_components] Resolved sessionId:`, sessionId);

      if (!sessionId) {
        logger.warn(`[list_components] No sessionId available in context`);
        return {
          components: [],
          count: 0,
          message: "No session ID available - component history requires session tracking",
        };
      }

      try {
        // List all components in this session
        const afsPath = `/modules/history/by-component`;
        logger.debug(`[list_components] Listing from AFS path: ${afsPath} with filter:`, { sessionId, limit });
        const result = await afs.list(afsPath, {
          filter: { sessionId },
          limit,
        });
        logger.debug(`[list_components] AFS list result - total entries: ${result.data?.length || 0}`);

        // Filter to only component-render entries (not component-state updates)
        const componentEntries = result.data.filter(
          (e: any) => e.metadata?.type === "component-render",
        );
        logger.debug(`[list_components] Filtered to component-render entries: ${componentEntries.length}`);

        const components = componentEntries.map((entry: any) => {
          const comp = {
            componentId: entry.id,
            componentName: entry.componentName || entry.content?.component?.name || "Unknown",
            createdAt: entry.createdAt?.toString(),
            summary: entry.summary || `${entry.componentName || "Component"} rendered`,
          };
          logger.debug(`[list_components] Component:`, comp);
          return comp;
        });

        logger.debug(`[list_components] Returning ${components.length} components`);

        return {
          components,
          count: components.length,
          message:
            components.length > 0
              ? `Found ${components.length} component(s) in this session`
              : "No components found in this session",
        };
      } catch (error: any) {
        logger.error(`[list_components] Error:`, error);
        return {
          components: [],
          count: 0,
          message: `Error listing components: ${error.message}`,
        };
      }
    },
  });

  return {
    getComponentSkill,
    listComponentsSkill,
  };
}
