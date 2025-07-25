import type { ChatModelInputMessage, Role } from "../agents/chat-model.js";
import { isNonNullable } from "./type-utils.js";

/**
 * Standard message structure for most chat providers
 */
export interface StandardMessage {
  role: string;
  content: string;
}

/**
 * Extended message structure with additional fields
 */
export interface ExtendedMessage extends StandardMessage {
  name?: string;
  tool_call_id?: string;
  tool_calls?: any[];
}

/**
 * Configuration for message transformation
 */
export interface MessageTransformOptions {
  /** Custom role mapping function */
  roleMapper?: (role: Role) => string;
  /** Whether to include multimodal content (images, etc.) */
  includeMultimodal?: boolean;
  /** How to handle multimodal content when not supported */
  multimodalFallback?: "ignore" | "text-only" | "error";
  /** Whether to include tool-related fields */
  includeToolFields?: boolean;
}

/**
 * Transforms AIGNE framework messages to standard provider format
 *
 * @param messages - Array of AIGNE messages to transform
 * @param options - Transformation options
 * @returns Array of transformed messages
 *
 * @example
 * ```typescript
 * import { transformMessages, STANDARD_ROLE_MAP, createRoleMapper } from "@aigne/core/utils";
 *
 * const roleMapper = createRoleMapper(STANDARD_ROLE_MAP);
 * const messages = transformMessages(input.messages, { roleMapper });
 * ```
 */
export function transformMessages<T extends StandardMessage = StandardMessage>(
  messages: ChatModelInputMessage[],
  options: MessageTransformOptions = {},
): T[] {
  const {
    roleMapper = (role: Role) => role,
    includeMultimodal = false,
    multimodalFallback = "text-only",
    includeToolFields = false,
  } = options;

  return messages.map((msg) => {
    const baseMessage: StandardMessage = {
      role: roleMapper(msg.role),
      content: extractMessageContent(msg.content, {
        includeMultimodal,
        multimodalFallback,
      }),
    };

    if (includeToolFields) {
      const extendedMessage = baseMessage as ExtendedMessage;

      if (msg.toolCalls?.length) {
        extendedMessage.tool_calls = msg.toolCalls.map((call: any) => ({
          ...call,
          function: {
            ...call.function,
            arguments:
              typeof call.function.arguments === "string"
                ? call.function.arguments
                : JSON.stringify(call.function.arguments),
          },
        }));
      }

      if (msg.toolCallId) {
        extendedMessage.tool_call_id = msg.toolCallId;
      }

      if (msg.name) {
        extendedMessage.name = msg.name;
      }
    }

    return baseMessage as T;
  });
}

/**
 * Extracts content from a message, handling both string and multimodal content
 */
function extractMessageContent(
  content: ChatModelInputMessage["content"],
  options: Pick<MessageTransformOptions, "includeMultimodal" | "multimodalFallback">,
): string {
  if (typeof content === "string") {
    return content;
  }

  if (!content || !Array.isArray(content)) {
    return "";
  }

  if (!options.includeMultimodal) {
    // Extract only text content
    return content
      .map((c) => {
        if (c.type === "text") {
          return c.text;
        }

        if (options.multimodalFallback === "error") {
          throw new Error(`Multimodal content not supported: ${c.type}`);
        }

        return null; // Ignore non-text content
      })
      .filter(isNonNullable)
      .join(" ");
  }

  // Include multimodal content (implementation depends on provider)
  // For now, we'll just extract text as fallback
  return content
    .map((c) => (c.type === "text" ? c.text : null))
    .filter(isNonNullable)
    .join(" ");
}

/**
 * Utility function to create a message transformer with pre-configured options
 */
export function createMessageTransformer<T extends StandardMessage = StandardMessage>(
  defaultOptions: MessageTransformOptions,
) {
  return (messages: ChatModelInputMessage[], options?: Partial<MessageTransformOptions>): T[] => {
    return transformMessages<T>(messages, { ...defaultOptions, ...options });
  };
}
