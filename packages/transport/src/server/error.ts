/**
 * Custom error class for AIGNEServer HTTP-related errors.
 * Extends the standard Error class with an HTTP status code property.
 * This allows error responses to include appropriate HTTP status codes.
 */
export class ServerError extends Error {
  /**
   * Creates a new ServerError instance.
   *
   * @param status - The HTTP status code for this error (e.g., 400, 404, 500)
   * @param message - The error message describing what went wrong
   */
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
