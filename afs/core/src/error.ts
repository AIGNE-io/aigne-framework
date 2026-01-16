/**
 * Base error class for all AFS errors.
 */
export class AFSError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "AFSError";
    this.code = code;
  }
}

/**
 * Error thrown when attempting write operations on a readonly AFS or module.
 */
export class AFSReadonlyError extends AFSError {
  constructor(message: string) {
    super(message, "AFS_READONLY");
    this.name = "AFSReadonlyError";
  }
}
