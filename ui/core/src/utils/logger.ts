/**
 * Logger for @aigne/ui package
 *
 * Namespace: aigne:ui:core
 *
 * Enable debug output:
 *   DEBUG=aigne:ui:* npm start          # All UI logs
 *   DEBUG=aigne:ui:core:* npm start     # Only UI core logs
 *   DEBUG=aigne:ui:core:debug npm start # Only UI core debug level
 */
import { createLogger } from "@aigne/core/utils/logger.js";

export const logger = createLogger("ui:core");
