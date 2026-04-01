import { zValidator } from "@hono/zod-validator";
import { statusQuerySchema } from "@/lib/schemas";
import { jsonError } from "@/lib/utils";

export const statusQueryValidator = zValidator(
  "query",
  statusQuerySchema,
  (result, c) => {
    if (!result.success) {
      return jsonError(c, "Invalid request query");
    }
  }
);
