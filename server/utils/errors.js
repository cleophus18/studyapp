export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (msg = "Bad request", details) =>
  new HttpError(400, msg, details);
export const unauthorized = (msg = "Authentication required") =>
  new HttpError(401, msg);
export const forbidden = (msg = "You do not have permission to do that") =>
  new HttpError(403, msg);
export const notFound = (msg = "Not found") => new HttpError(404, msg);
export const conflict = (msg = "Conflict") => new HttpError(409, msg);

/** Wraps async route handlers so thrown errors reach the error middleware. */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// eslint-disable-next-line no-unused-vars
export function errorMiddleware(err, req, res, _next) {
  if (err instanceof HttpError) {
    return res
      .status(err.status)
      .json({ error: err.message, details: err.details });
  }
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  if (
    err?.code === "SQLITE_CONSTRAINT_UNIQUE" ||
    /UNIQUE constraint failed/i.test(err?.message || "")
  ) {
    return res
      .status(409)
      .json({ error: "A record with those details already exists" });
  }
  console.error("[unhandled error]", err);
  res.status(500).json({ error: "Internal server error" });
}
