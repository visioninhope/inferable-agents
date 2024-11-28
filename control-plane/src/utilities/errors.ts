export class RetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RetryableError";
  }
}

const retryableErrorMessages = [
  "Connection terminated due to connection timeout",
  "timeout exceeded when trying to connect",
  "Connection terminated unexpectedly",
  "account does not have an agreement to this model",
];

export const isRetryableError = (error: unknown) => {
  if (error instanceof Error && retryableErrorMessages.includes(error.message))
    return true;

  return error instanceof RetryableError;
};

export class AuthenticationError extends Error {
  statusCode = 401;

  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class NotFoundError extends Error {
  statusCode: number = 404;

  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends Error {
  statusCode: number = 400;

  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

export class JobPollTimeoutError extends Error {
  statusCode: number = 408;

  constructor(message: string) {
    super(message);
    this.name = "JobRequestTimeoutError";
  }
}

export class InvalidServiceRegistrationError extends Error {
  statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = "InvalidServiceRegistrationError";
  }
}

export class InvalidJobArgumentsError extends Error {
  statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = "InvalidArgumentsError";
  }
}

export class ContentTooLarge extends Error {
  statusCode = 413;

  constructor(message: string) {
    super(message);
    this.name = "ContentTooLarge";
  }
}

export class AgentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AgentError";
  }
}

export class JobAuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JobAuthenticationError";
  }
}

export class PromptableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PromptableError";
  }
}

export class RunBusyError extends Error {
  statusCode = 409;

  constructor(
    message: string = "Run is still processing, please try again later.",
  ) {
    super(message);
    this.name = "RunBusyError";
  }
}
