import {
  BarbellIcon,
  BicycleIcon,
  CubeIcon,
  PersonSimpleIcon,
  PlugsIcon,
  TimerIcon,
  type Icon,
} from "@phosphor-icons/react";
import type { Equipment } from "@/types";
import { equipmentMeta } from "@/types";
import { cn } from "@/lib/cn";

type EquipmentToggleProps = {
  options: Equipment[];
  value: Equipment;
  onChange: (value: Equipment) => void;
};

const ICONS: Record<Equipment, Icon> = {
  barbell: BarbellIcon,
  dumbbell: BicycleIcon,
  smith: CubeIcon,
  machine: PlugsIcon,
  cable: PlugsIcon,
  bodyweight: PersonSimpleIcon,
  time: TimerIcon,
};

export const EquipmentToggle = ({
  options,
  value,
  onChange,
}: EquipmentToggleProps) => {
  return (
    <div
      className="flex gap-1 overflow-x-auto rounded-xl bg-muted p-1 [&::-webkit-scrollbar]:hidden"
      role="radiogroup"
      aria-label="Equipamento"
    >
      {options.map((opt) => {
        const active = opt === value;
        const IconCmp = ICONS[opt];
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt)}
            className={cn(
              "flex flex-1 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <IconCmp size={18} weight={active ? "fill" : "regular"} />
            {equipmentMeta(opt).label}
          </button>
        );
      })}
    </div>
  );
};
