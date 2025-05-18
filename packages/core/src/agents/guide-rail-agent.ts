import { z } from "zod";
import type { Agent, AgentOptions, Message } from "./agent.js";

/**
 * Input interface for GuideRail agents
 *
 * GuideRail agents receive both input and expected output, allowing them to
 * validate, transform, or control the flow of messages between other agents.
 */
export interface GuideRailAgentInput extends Message {
  /**
   * The input data to be processed
   *
   * This is the original message that would be sent to the target agent
   */
  input?: unknown;

  /**
   * The expected output data
   *
   * This is what the target agent is expected to produce, allowing
   * the GuideRail agent to validate or transform the data flow
   */
  output?: unknown;
}

/**
 * Output interface for GuideRail agents
 *
 * GuideRail agents can either allow the process to continue or abort it with a reason.
 * This provides a mechanism for enforcing rules, validating data, and controlling
 * the execution flow of the agent system.
 */
export interface GuideRailAgentOutput extends Message {
  /**
   * Whether to abort the current process
   *
   * When true, the agent system should stop the current execution flow
   * and prevent further processing based on this input/output pair
   *
   * @default false
   */
  abort?: boolean;

  /**
   * Reason for aborting the process
   *
   * When abort is true, this provides a human-readable explanation
   * for why the process was stopped
   */
  reason?: string;
}

/**
 * GuideRail agent type definition
 *
 * GuideRail agents act as validators, transformers, or controllers for the message
 * flow between agents. They can enforce rules, perform safety checks, ensure data
 * quality, or implement business logic validations.
 *
 * Use GuideRail agents when you need to:
 * - Validate inputs or outputs against specific criteria
 * - Enforce security or safety policies
 * - Implement business rules that control agent interactions
 * - Monitor and audit agent behavior
 */
export type GuideRailAgent = Agent<GuideRailAgentInput, GuideRailAgentOutput>;

export const guideRailAgentOptions: AgentOptions<GuideRailAgentInput, GuideRailAgentOutput> = {
  inputSchema: z.object({
    input: z.unknown(),
    output: z.unknown(),
  }),
  outputSchema: z.object({
    abort: z.boolean().optional().describe("Whether to abort the current process"),
    reason: z.string().optional().describe("Reason for aborting the process"),
  }),
};
