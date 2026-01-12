/**
 * Logger for @aigne/openai package
 *
 * Namespace: aigne:models:openai
 *
 * Enable debug output:
 *   DEBUG=aigne:models:* npm start           # All model logs
 *   DEBUG=aigne:models:openai:* npm start    # Only OpenAI logs
 *   DEBUG=aigne:models:openai:debug npm start # Only OpenAI debug level
 */
import { createLogger } from "@aigne/core/utils/logger.js";

export const logger = createLogger("models:openai");
