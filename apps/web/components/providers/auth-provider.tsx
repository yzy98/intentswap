"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createSiweMessage } from "viem/siwe";
import { useChainId, useConfig, useConnection } from "wagmi";
import { signMessage } from "wagmi/actions";
import { authClient, useSession } from "@/lib/client/auth";

interface AuthContextValue {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { address } = useConnection();
  const chainId = useChainId();
  const config = useConfig();
  const previousAddressRef = useRef<string | undefined>(address);

  const { data, refetch } = useSession();

  useEffect(() => {
    const previousAddress = previousAddressRef.current?.toLowerCase();
    const currentAddress = address?.toLowerCase();
    const hasSession = !!data?.session;

    // If the connected wallet changes (or disconnects) while a session exists,
    // clear the SIWE session to avoid wallet/session mismatch.
    const hasWalletChanged =
      !!previousAddress &&
      ((!!currentAddress && previousAddress !== currentAddress) ||
        !currentAddress);

    if (hasSession && hasWalletChanged) {
      authClient.signOut().finally(() => {
        refetch();
      });
    }

    previousAddressRef.current = address;
  }, [address, data?.session, refetch]);

  const signIn = useCallback(async () => {
    if (!(address && chainId)) {
      return;
    }

    setIsAuthenticating(true);
    try {
      // Step 1: Generate nonce
      const { data: nonceData, error: nonceError } =
        await authClient.siwe.nonce({
          walletAddress: address,
          chainId,
        });

      if (nonceError) {
        throw new Error(nonceError.message);
      }

      // Step 2: Create SIWE message
      const message = createSiweMessage({
        address,
        chainId,
        nonce: nonceData.nonce,
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

      // Step 4: Verify SIWE
      const { data: verifyData, error: verifyError } =
        await authClient.siwe.verify({
          message,
          signature,
          walletAddress: address,
          chainId,
        });

      if (verifyError) {
        throw new Error(verifyError.message);
      }

      if (verifyData.success) {
        refetch();
        return;
      }

      throw new Error("Authentication failed");
    } catch (error) {
      console.error("SIWE sign-in failed:", error);
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, chainId, config, refetch]);

  const signOut = () => authClient.signOut();

  return (
    <AuthContext
      value={{
        isAuthenticating,
        isAuthenticated: !!data?.session,
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
