import { intent } from "@packages/db";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/clients/db-client";
import { builder } from "@/graphql/builder";
import { IntentRef, IntentStatusGql } from "@/graphql/models/intent";

// Query the count of intents for a user
builder.queryField("userIntentsCount", (t) =>
  t.field({
    type: "Int",
    args: {
      user: t.arg.string({ required: true }),
      status: t.arg({
        type: IntentStatusGql,
        required: false,
      }),
    },
    resolve: async (_, { user, status }) => {
      const whereClause = status
        ? and(eq(intent.user, user), eq(intent.status, status))
        : eq(intent.user, user);

      const [result] = await db
        .select({ count: count() })
        .from(intent)
        .where(whereClause);

      return result?.count ?? 0;
    },
  })
);

// Query intents for a user
builder.queryField("userIntents", (t) =>
  t.field({
    type: [IntentRef],
    args: {
      user: t.arg.string({ required: true }),
      status: t.arg({
        type: IntentStatusGql,
        required: false,
      }),
      limit: t.arg.int({ defaultValue: 5, required: false }),
      offset: t.arg.int({ defaultValue: 0, required: false }),
    },
    resolve: async (_, { user, status, limit, offset }) =>
      db.query.intent.findMany({
        where: (intent, { eq, and }) =>
          status
            ? and(eq(intent.user, user), eq(intent.status, status))
            : eq(intent.user, user),
        limit: limit ?? undefined,
        offset: offset ?? undefined,
      }),
  })
);
