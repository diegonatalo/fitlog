import type { MuscleGroup } from "@/types";
import { muscleLabel } from "@/types";
import { cn } from "@/lib/cn";

type MuscleBadgeProps = {
  group: MuscleGroup;
  size?: "sm" | "md";
};

export const MuscleBadge = ({ group, size = "sm" }: MuscleBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full bg-muted font-semibold text-foreground/85",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-[13px]",
      )}
    >
      {muscleLabel(group)}
    </span>
  );
};
