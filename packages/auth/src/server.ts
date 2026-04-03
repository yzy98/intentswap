import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { generateRandomString } from "better-auth/crypto";
import { type SIWEPluginOptions, siwe } from "better-auth/plugins";

interface AuthOptions {
  db: Parameters<typeof drizzleAdapter>[0];
  secret: string;
  baseURL: string;
  trustedOrigins: string[];
  domain: string;
  crossCookieDomain: string;
  isProd: boolean;
  verifyMessage: (
    args: Pick<
      Parameters<SIWEPluginOptions["verifyMessage"]>[0],
      "address" | "message" | "signature"
    >
  ) => Promise<boolean>;
}

export const createAuth = ({
  db,
  secret,
  baseURL,
  trustedOrigins,
  domain,
  crossCookieDomain,
  isProd,
  verifyMessage,
}: AuthOptions) =>
  betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    secret,
    baseURL,
    trustedOrigins,
    advanced: {
      crossSubDomainCookies: isProd
        ? {
            enabled: true,
            domain: crossCookieDomain,
          }
        : {
            enabled: false,
          },
    },
    plugins: [
      siwe({
        domain,
        // biome-ignore lint/suspicious/useAwait: better-auth expects an async function
        getNonce: async () => {
          return generateRandomString(32, "a-z", "A-Z", "0-9");
        },
        verifyMessage,
      }),
    ],
  });
