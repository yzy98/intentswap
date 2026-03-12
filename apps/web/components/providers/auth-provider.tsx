"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Address } from "viem";
import { createSiweMessage } from "viem/siwe";
import { useChainId, useConfig, useConnection } from "wagmi";
import { signMessage } from "wagmi/actions";
import { fetchNonce, verifyAuth } from "@/lib/api/auth";

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const previousAddressRef = useRef<Address | undefined>(undefined);

  const { address, isConnected } = useConnection();
  const chainId = useChainId();
  const config = useConfig();

  // Clear JWT token when user disconnects
  useEffect(() => {
    if (!isConnected) {
      setToken(null);
    }
  }, [isConnected]);

  // When user address changes, clear JWT token and update previous address
  useEffect(() => {
    if (
      previousAddressRef.current &&
      address &&
      previousAddressRef.current.toLowerCase() !== address.toLowerCase()
    ) {
      setToken(null);
    }

    previousAddressRef.current = address;
  }, [address]);

  const signIn = useCallback(async () => {
    if (!(address && chainId)) {
      return;
    }

    setIsAuthenticating(true);
    try {
      // Step 1: Fetch nonce
      const nonce = await fetchNonce();

      // Step 2: Create SIWE message
      const message = createSiweMessage({
        address,
        chainId,
        nonce,
        domain: window.location.host,
        uri: window.location.origin,
        version: "1",
        statement: "Sign in to Intentswap",
      });

      // Step 3: Sign message
      const signature = await signMessage(config, {
        account: address,
        message,
      });

      // Step 4: Verify authentication
      const jwt = await verifyAuth(message, signature);
      setToken(jwt);
    } catch (error) {
      console.error("SIWE sign-in failed:", error);
      setToken(null);
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, chainId, config]);

  const signOut = () => setToken(null);

  return (
    <AuthContext
      value={{
        token,
        isAuthenticated: !!token,
        isAuthenticating,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};
