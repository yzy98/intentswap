import type { LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ColumnHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  icon?: LucideIcon;
}

export const ColumnHeader = ({ className, title, icon }: ColumnHeaderProps) => {
  const Icon = icon;

  return (
    <div className={className}>
      {Icon ? (
        <Tooltip>
          <TooltipTrigger>
            <Icon size={18} />
            <span className="sr-only">{title}</span>
          </TooltipTrigger>
          <TooltipContent>{title}</TooltipContent>
        </Tooltip>
      ) : (
        <span className="sr-only">{title}</span>
      )}
    </div>
  );
};
