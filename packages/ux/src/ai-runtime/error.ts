export class CustomError extends Error {
  constructor(
    public status: string | number,
    message: string,
  ) {
    super(message);
  }
}
