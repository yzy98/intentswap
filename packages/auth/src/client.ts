import { siweClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const createClient = (baseURL: string) =>
  createAuthClient({
    baseURL,
    plugins: [siweClient()],
  });

export { createClient as createAuthClient };
