import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useChainId } from "wagmi";
import { Switch } from "@/components/ui/switch";
import { subscribeBotOrNot } from "@/lib/api/bot";

interface BotSwitchCellProps {
  intentId: bigint;
  isActive: boolean;
  isExpired: boolean;
  botSubscribed: boolean;
  refetch?: () => Promise<unknown>;
}

export const BotSwitchCell = ({
  intentId,
  isActive,
  isExpired,
  botSubscribed,
  refetch,
}: BotSwitchCellProps) => {
  const chainId = useChainId();

  const { mutateAsync: toggleBot, isPending } = useMutation({
    mutationFn: async (subscribe: boolean) => {
      await subscribeBotOrNot({
        subscribe,
        intentId,
        chainId,
      });
    },
    onSuccess: refetch,
  });

  if (!isActive || isExpired) {
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
