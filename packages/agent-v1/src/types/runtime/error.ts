export enum RuntimeErrorType {
  MissingSecretError = "MissingSecretError",
  RequestExceededError = "RequestExceededError",
  ProjectOwnerRequestExceededError = "ProjectOwnerRequestExceededError",
  ProjectLimitExceededError = "ProjectLimitExceededError",
}

export class RuntimeError extends Error {
  constructor(
    public type: RuntimeErrorType,
    message?: string,
  ) {
    super(message);
  }
}
