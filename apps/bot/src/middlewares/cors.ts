import { cors } from "hono/cors";
import type { AppContext } from "@/lib/types";

export const corsMiddleware = cors({
  origin: (_origin, c) => (c as AppContext).env.CORS_ORIGIN,
  allowHeaders: ["Content-Type", "Authorization"],
  exposeHeaders: ["Content-Length"],
  maxAge: 86_400,
  credentials: true,
});
