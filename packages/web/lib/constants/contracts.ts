import { intentExecutorAbi } from "@/abis/intentExecutor";
import { intentFactoryAbi } from "@/abis/intentFactory";
import { oracleAbi } from "@/abis/oracle";
import { swapperAbi } from "@/abis/swapper";
import {
  CONTRACT_INTENT_EXECUTOR_ADDRESS,
  CONTRACT_INTENT_FACTORY_ADDRESS,
  CONTRACT_ORACLE_ADDRESS,
  CONTRACT_SWAPPER_ADDRESS,
} from "./addresses";

export const oracleContract = {
  address: CONTRACT_ORACLE_ADDRESS,
  abi: oracleAbi,
} as const;

export const swapperContract = {
  address: CONTRACT_SWAPPER_ADDRESS,
  abi: swapperAbi,
} as const;

export const intentFactoryContract = {
  address: CONTRACT_INTENT_FACTORY_ADDRESS,
  abi: intentFactoryAbi,
} as const;

export const intentExecutorContract = {
  address: CONTRACT_INTENT_EXECUTOR_ADDRESS,
  abi: intentExecutorAbi,
} as const;
