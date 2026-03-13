import { yoga } from "@/graphql/yoga";
import type { Env } from "./env";
import { createServices } from "./services";

export default {
  async fetch(request, env): Promise<Response> {
    // Get URL
    const url = new URL(request.url);

    // Handle CORS preflight for auth routes
    if (request.method === "OPTIONS" && url.pathname.startsWith("/api/auth/")) {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": env.CORS_ORIGIN,
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Rate limiting
    const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
    const { success } = await env.API_RATE_LIMITER.limit({ key: ip });
    if (!success) {
      return new Response("Rate limit exceeded", {
        status: 429,
      });
    }

    // Services
    const { auth } = createServices(env);

    // Handle auth routes
    if (url.pathname.startsWith("/api/auth/")) {
      const res = await auth.handler(request);
      // Append CORS headers to auth handler responses
      const headers = new Headers(res.headers);
      headers.set("Access-Control-Allow-Origin", env.CORS_ORIGIN);
      headers.set("Access-Control-Allow-Credentials", "true");
      return new Response(res.body, { status: res.status, headers });
    }

    return yoga.fetch(request, { ...env, auth });
  },
} satisfies ExportedHandler<Env>;
