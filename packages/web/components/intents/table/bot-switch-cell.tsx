import { useMutation } from "@tanstack/react-query";
import type { Row } from "@tanstack/react-table";
import { toast } from "sonner";
import { useChainId, useConnection } from "wagmi";
import { Switch } from "@/components/ui/switch";
import type { IntentRow } from "@/lib/types";

const BOT_API_URL =
  process.env.NEXT_PUBLIC_BOT_API_URL ?? "http://localhost:8787";

interface BotSwitchCellProps {
  row: Row<IntentRow>;
  refetch?: () => Promise<unknown>;
}

export const BotSwitchCell = ({ row, refetch }: BotSwitchCellProps) => {
  const { intentId, isActive, canExecute, botSubscribed } = row.original;

  const { address } = useConnection();
  const chainId = useChainId();

  const { mutateAsync: toggleBot, isPending } = useMutation({
    mutationFn: async (subscribe: boolean) => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      const endpoint = subscribe ? "subscribe" : "unsubscribe";
      const response = await fetch(`${BOT_API_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intentId: intentId.toString(),
          chainId,
          user: address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to toggle bot auto-execution");
      }

      return data;
    },
    onSuccess: refetch,
  });

  if (!(isActive && canExecute)) {
    return (
      <Switch
        aria-label="Bot auto-execution disabled"
        checked={botSubscribed}
        disabled
      />
    );
  }

  const handleToggle = (checked: boolean) => {
    toast.promise(toggleBot(checked), {
      loading: checked
        ? "Enabling bot auto-execution..."
        : "Disabling bot auto-execution...",
      success: checked
        ? "Bot auto-execution enabled"
        : "Bot auto-execution disabled",
      error: (err: Error) => err.message,
    });
  };
  return (
    <Switch
      aria-label="Toggle bot auto-execution"
      checked={botSubscribed}
      disabled={isPending}
      onCheckedChange={handleToggle}
    />
  );
};
