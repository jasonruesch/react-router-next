export class NotFoundError extends Error {
  readonly __rrn_not_found = true;
  constructor() {
    super("NEXT_NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { __rrn_not_found?: unknown }).__rrn_not_found === true
  );
}

export function notFound(): never {
  throw new NotFoundError();
}
