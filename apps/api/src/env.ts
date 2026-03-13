export interface Env {
  INTENTSWAP_AUTH_NONCE: KVNamespace;
  API_RATE_LIMITER: RateLimit;
  DATABASE_URL: string;
  JWT_SECRET: string;
  CORS_ORIGIN: string;
  ENVIRONMENT: string;
  CHAIN_ID: string;
  RPC_URL: string;
}
