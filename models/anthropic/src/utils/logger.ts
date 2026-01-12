/**
 * Logger for @aigne/anthropic package
 *
 * Namespace: aigne:models:anthropic
 *
 * Enable debug output:
 *   DEBUG=aigne:models:* npm start              # All model logs
 *   DEBUG=aigne:models:anthropic:* npm start    # Only Anthropic logs
 *   DEBUG=aigne:models:anthropic:debug npm start # Only Anthropic debug level
 */
import { createLogger } from "@aigne/core/utils/logger.js";

export const logger = createLogger("models:anthropic");
