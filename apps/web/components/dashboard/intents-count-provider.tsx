"use client";

import type React from "react";
import { createContext, useContext } from "react";
import type { Address } from "viem";
import {
  type UseIntentsCountQueryResult,
  useIntentsCountQuery,
} from "@/hooks/use-intents-count-query";

interface IntentsCountContextValue extends UseIntentsCountQueryResult {}

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
  const { data, fetching, error, reExecuteQuery } = useIntentsCountQuery({
    user: address,
  });

  return (
    <IntentsCountContext
      value={{
        data,
        fetching,
        error,
        reExecuteQuery,
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
