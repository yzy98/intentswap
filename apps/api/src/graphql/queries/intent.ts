import { intent, walletAddress } from "@packages/db/schema";
import { and, count, eq } from "drizzle-orm";
import { GraphQLError } from "graphql";
import { builder, type Context } from "@/graphql/builder";
import { IntentRef, IntentStatusGql } from "@/graphql/models/intent";

const MAX_LIMIT = 50;

const getAuthenticatedWalletAddress = async (ctx: Context) => {
  if (!ctx.user) {
    throw new GraphQLError("Authorization required", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }

  const [result] = await ctx.db
    .select({ address: walletAddress.address })
    .from(walletAddress)
    .where(
      and(
        eq(walletAddress.userId, ctx.user.id),
        eq(walletAddress.isPrimary, true)
      )
    );

  if (!result) {
    throw new GraphQLError("No wallet address found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return result.address.toLowerCase();
};

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

      const safeLimit = Math.min(Math.max(limit ?? 5, 1), MAX_LIMIT);
      const safeOffset = Math.max(offset ?? 0, 0);
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
