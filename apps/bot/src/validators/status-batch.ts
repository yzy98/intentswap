import { zValidator } from "@hono/zod-validator";
import { statusBatchQuerySchema } from "@/lib/schemas";
import { jsonError } from "@/lib/utils";

export const statusBatchQueryValidator = zValidator(
  "query",
  statusBatchQuerySchema,
  (result, c) => {
    if (!result.success) {
      return jsonError(c, "Invalid request query");
    }
  }
);
