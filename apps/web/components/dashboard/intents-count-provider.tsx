"use client";

import type React from "react";
import { createContext, useContext } from "react";
import type { Address } from "viem";
import { useIntentsCountQuery } from "@/hooks/use-intents-count-query";

type IntentsCountContextValue = ReturnType<typeof useIntentsCountQuery>;

const IntentsCountContext = createContext<IntentsCountContextValue | null>(
  null
);

export const IntentsCountProvider = ({
  children,
  address,
}: {
  children: React.ReactNode;
  address: Address;
}) => {
  const result = useIntentsCountQuery({
    user: address,
  });

  return (
    <IntentsCountContext
      value={{
        ...result,
      }}
    >
      {children}
    </IntentsCountContext>
  );
};

export const useIntentsCount = () => {
  const context = useContext(IntentsCountContext);
  if (!context) {
    throw new Error(
      "useIntentsCount must be used within an IntentsCountProvider"
    );
  }
  return context;
};
