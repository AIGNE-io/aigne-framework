/**
 * Type declarations for third-party modules used across AIGNE framework
 */

declare module "jaison" {
  /**
   * A robust JSON parser that handles malformed JSON better than JSON.parse
   * @param text - The JSON text to parse
   * @returns The parsed JSON object
   */
  function jaison(text: string): any;
  export = jaison;
}
