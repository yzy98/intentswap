import { and, count, eq } from "@packages/db/helper";
import { intent } from "@packages/db/schema";
import { GraphQLError } from "graphql";
import { builder } from "@/graphql/builder";
import { IntentRef, IntentStatusGql } from "@/graphql/models/intent";
import { getAuthenticatedWalletAddress, getSafeLimitAndOffset } from "./utils";

// Query the count of intents for a user
builder.queryField("userIntentsCount", (t) =>
  t.field({
    type: "Int",
    args: {
      user: t.arg({
        type: "EthAddress",
        required: true,
      }),
      status: t.arg({
        type: IntentStatusGql,
        required: false,
      }),
    },
    resolve: async (_, { user, status }, ctx) => {
      // Fetch authenticated user's wallet address
      const address = await getAuthenticatedWalletAddress(ctx);

      // Check if user is the same as the authenticated user's address
      if (address.toLowerCase() !== user.toLowerCase()) {
        throw new GraphQLError("Forbidden: cannot query other user's intents", {
          extensions: {
            code: "FORBIDDEN",
          },
        });
      }

      const whereClause = status
        ? and(eq(intent.user, address), eq(intent.status, status))
        : eq(intent.user, address);

      const [result] = await ctx.db
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
      user: t.arg({
        type: "EthAddress",
        required: true,
      }),
      status: t.arg({
        type: IntentStatusGql,
        required: false,
      }),
      limit: t.arg.int({ defaultValue: 5, required: false }),
      offset: t.arg.int({ defaultValue: 0, required: false }),
    },
    resolve: async (_, { user, status, limit, offset }, ctx) => {
      // Fetch authenticated user's wallet address
      const address = await getAuthenticatedWalletAddress(ctx);

      // Check if user is the same as the authenticated user's address
      if (address.toLowerCase() !== user.toLowerCase()) {
        throw new GraphQLError("Forbidden: cannot query other user's intents", {
          extensions: {
            code: "FORBIDDEN",
          },
        });
      }

      const { safeLimit, safeOffset } = getSafeLimitAndOffset({
        limit,
        offset,
        defaultLimit: 5,
      });

      const result = await ctx.db.query.intent.findMany({
        where: (intent, { eq, and }) =>
          status
            ? and(eq(intent.user, address), eq(intent.status, status))
            : eq(intent.user, address),
        limit: safeLimit,
        offset: safeOffset,
        orderBy: (intent, { desc }) => desc(intent.createdAt),
      });

      return result;
    },
  })
);
