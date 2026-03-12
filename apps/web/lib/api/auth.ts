const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export const fetchNonce = async (): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/auth/nonce`);
  if (!response.ok) {
    throw new Error("Failed to fetch nonce");
  }
  const { nonce } = (await response.json()) as { nonce: string };
  return nonce;
};

export const verifyAuth = async (message: string, signature: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, signature }),
  });
  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error ?? "Verification failed");
  }
  const { token } = (await response.json()) as { token: string };
  return token;
};
