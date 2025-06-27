import jsonata from "jsonata";
import { Agent, type AgentOptions, type Message } from "./agent.js";

/**
 * Configuration options for TransformAgent
 *
 * TransformAgent is a specialized agent that transforms input data to output data
 * using [JSONata](https://jsonata.org/) expressions. It's particularly useful for:
 * - Data format conversion (e.g., snake_case to camelCase)
 * - Field mapping and renaming
 * - Data structure transformation
 * - Simple data processing without complex logic
 * - API response normalization
 * - Configuration data transformation
 */
export interface TransformAgentOptions<I extends Message, O extends Message>
  extends AgentOptions<I, O> {
  /**
   * JSONata expression string for data transformation
   *
   * JSONata is a lightweight query and transformation language for JSON data.
   * The expression defines how input data should be transformed into output data.
   *
   * Common JSONata patterns:
   * - Field mapping: `{ "newField": oldField }`
   * - Array transformation: `items.{ "name": product_name, "price": price }`
   * - Calculations: `$sum(items.price)`, `$count(items)`
   * - Conditional logic: `condition ? value1 : value2`
   * - String operations: `$uppercase(name)`, `$substring(text, 0, 10)`
   *
   * @see https://jsonata.org/ for complete JSONata syntax documentation
   * @see https://try.jsonata.org/ for interactive JSONata playground
   */
  jsonata: string;
}

/**
 * TransformAgent - A specialized agent for data transformation using JSONata expressions
 *
 * This agent provides a declarative way to transform structured data without writing
 * custom processing logic. It leverages the power of JSONata, a lightweight query and
 * transformation language, to handle complex data manipulations through simple expressions.
 *
 * Common Use Cases:
 * - API response normalization and field mapping
 * - Database query result transformation
 * - Configuration data restructuring
 * - Data format conversion (snake_case ↔ camelCase)
 * - Aggregation and calculation operations
 * - Filtering and conditional data processing
 */
export class TransformAgent<I extends Message = Message, O extends Message = Message> extends Agent<
  I,
  O
> {
  static type = "TransformAgent";

  /**
   * Factory method to create a new TransformAgent instance
   *
   * Provides a convenient way to create TransformAgent instances with proper typing
   *
   * @param options Configuration options for the TransformAgent
   * @returns A new TransformAgent instance
   */
  static from<I extends Message, O extends Message>(options: TransformAgentOptions<I, O>) {
    return new TransformAgent(options);
  }

  /**
   * Create a new TransformAgent instance
   *
   * @param options Configuration options including the JSONata expression
   */
  constructor(options: TransformAgentOptions<I, O>) {
    super(options);
    this.jsonata = options.jsonata;
  }

  /**
   * The JSONata expression string used for data transformation
   *
   * This expression is compiled and executed against input data to produce
   * the transformed output. The expression is stored as a string and compiled
   * on each invocation for maximum flexibility.
   */
  private jsonata: string;

  /**
   * Process input data using the configured JSONata expression
   *
   * This method compiles the JSONata expression and evaluates it against the input data.
   *
   * @param input The input message to transform
   * @returns Promise resolving to the transformed output message
   */
  async process(input: I): Promise<O> {
    const expression = jsonata(this.jsonata);
    return await expression.evaluate(input);
  }
}
