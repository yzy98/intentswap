import { handleGetNonce } from "@/auth/nonce";
import { handleVerify } from "@/auth/verify";
import { yoga } from "@/graphql/yoga";
import type { Env } from "./env";
import { createServices } from "./services";

export default {
  async fetch(request, env): Promise<Response> {
    // Get URL
    const url = new URL(request.url);

    // Handle preflight for auth routes
    if (request.method === "OPTIONS" && url.pathname.startsWith("/auth/")) {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    // Rate limiting
    const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
    const { success } = await env.API_RATE_LIMITER.limit({ key: ip });
    if (!success) {
      const res = new Response("Rate limit exceeded", {
        status: 429,
      });
      return url.pathname.startsWith("/auth/")
        ? appendCorsHeaders(res, env)
        : res;
    }

    // Get nonce
    if (url.pathname === "/auth/nonce" && request.method === "GET") {
      const res = await handleGetNonce(request, env);
      // Append CORS headers to the response
      return appendCorsHeaders(res, env);
    }

    // Services
    const services = createServices(env);

    // Post verify
    if (url.pathname === "/auth/verify" && request.method === "POST") {
      const res = await handleVerify(request, env, services);
      // Append CORS headers to the response
      return appendCorsHeaders(res, env);
    }

    return yoga.fetch(request, env);
  },
} satisfies ExportedHandler<Env>;

const corsHeaders = (env: Env) => ({
  "Access-Control-Allow-Origin": env.CORS_ORIGIN,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
});

/**
 * Append CORS headers to a response and return the response
 * @param res - The response to append CORS headers to
 * @param env - The environment variables
 * @returns The response with CORS headers appended
 */
const appendCorsHeaders = (res: Response, env: Env) => {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(corsHeaders(env))) {
    headers.set(k, v);
  }
  return new Response(res.body, { status: res.status, headers });
};
