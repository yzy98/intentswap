"use client";

import { useConnection, useReadContract } from "wagmi";
import { oracleContractSepolia } from "@/lib/constants";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { address, isConnecting } = useConnection();

  const { data: ownerAddress, isLoading } = useReadContract({
    ...oracleContractSepolia,
    functionName: "owner",
  });

  if (isConnecting || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <h1 className="font-bold text-2xl">Admin Access Required</h1>
        <p className="text-muted-foreground">
          Please connect your wallet to access the admin panel.
        </p>
      </div>
    );
  }

  if (address !== ownerAddress) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <h1 className="font-bold text-2xl text-destructive">Access Denied</h1>
        <p className="text-muted-foreground">
          Only the contract owner can access this page.
        </p>
        <p className="text-muted-foreground text-sm">Connected: {address}</p>
        <p className="text-muted-foreground text-sm">Owner: {ownerAddress}</p>
      </div>
    );
  }

  return <>{children}</>;
}
