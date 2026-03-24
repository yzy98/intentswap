import { and, eq } from "@packages/db/helper";
import { walletAddress } from "@packages/db/schema";
import { GraphQLError } from "graphql";
import type { Context } from "@/graphql/builder";

const MAX_LIMIT = 50;

export const getSafeLimitAndOffset = ({
  limit,
  offset,
  defaultLimit,
}: {
  limit?: number | null;
  offset?: number | null;
  defaultLimit: number;
}) => {
  const safeLimit = Math.min(Math.max(limit ?? defaultLimit, 1), MAX_LIMIT);
  const safeOffset = Math.max(offset ?? 0, 0);
  return { safeLimit, safeOffset };
};

export const getAuthenticatedWalletAddress = async (ctx: Context) => {
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
