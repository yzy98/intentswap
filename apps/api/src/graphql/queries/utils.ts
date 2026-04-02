import { GraphQLError } from "graphql";
import type { Context } from "@/graphql/builder";
import { getPrimaryWalletAddressByUserId } from "@/lib/utils";

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

  const address = await getPrimaryWalletAddressByUserId(ctx.db, ctx.user.id);

  if (!address) {
    throw new GraphQLError("No wallet address found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return address;
};
