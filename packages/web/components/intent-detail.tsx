import { formatEther } from "viem";
import { useReadContract } from "wagmi";
import { intentFactoryAbi } from "@/abis/intentFactory";
import { SEPOLIA_CONTRACT_INTENT_FACTORY_ADDRESS } from "@/lib/constants";

interface Props {
  intentId: bigint;
}

export const IntentDetail = ({ intentId }: Props) => {
  const { data: intent } = useReadContract({
    abi: intentFactoryAbi,
    address: SEPOLIA_CONTRACT_INTENT_FACTORY_ADDRESS,
    functionName: "getIntent",
    args: [intentId],
  });

  return (
    <div className="flex flex-col gap-2">
      <span>Intent ID: {intentId.toString()}</span>
      <span>User: {intent?.user}</span>
      <span>Token From: {intent?.tokenFrom}</span>
      <span>Token To: {intent?.tokenTo}</span>
      <span>Amount: {formatEther(intent?.amount ?? BigInt(0))}</span>
      <span>
        Price Threshold: {formatEther(intent?.priceThreshold ?? BigInt(0))}
      </span>
      <span>
        Expiration:{" "}
        {new Date(
          Number(intent?.expiration ?? BigInt(0)) * 1000
        ).toLocaleString()}
      </span>
      <span>Status: {intent?.status}</span>
    </div>
  );
};
