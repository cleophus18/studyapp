import { badRequest } from "../utils/errors.js";

/**
 * Validates req[source] against a zod schema and replaces it with the parsed value.
 * Field-level messages are returned so the client can show inline errors.
 */
export const validate =
  (schema, source = "body") =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const fields = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".") || "_";
        if (!fields[key]) fields[key] = issue.message;
      }
      return next(badRequest("Validation failed", fields));
    }
    req[source] = result.data;
    next();
  };
