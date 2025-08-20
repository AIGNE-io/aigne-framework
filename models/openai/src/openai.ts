import OpenAI, { type APIError } from "openai";

// Use a custom OpenAI client to handle API errors for better error messages
export class CustomOpenAI extends OpenAI {
  protected override makeStatusError(
    status: number,
    error: object,
    message: string | undefined,
    headers: Headers,
  ): APIError {
    if (!("error" in error) || typeof error.error !== "string") {
      message = JSON.stringify(error);
    }

    return super.makeStatusError(status, error, message, headers);
  }
}
