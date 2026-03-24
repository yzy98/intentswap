import { cors } from "hono/cors";
import type { AppContext } from "@/lib/types";

export const authCorsMiddleware = cors({
  origin: (_origin, c) => (c as AppContext).env.CORS_ORIGIN,
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["POST", "GET", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
  credentials: true,
});
