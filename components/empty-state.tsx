import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: Icon;
  title: string;
  description: string;
  action?: ReactNode;
};

export const EmptyState = ({
  icon: IconCmp,
  title,
  description,
  action,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-input px-6 py-14 text-center">
      <span className="mb-4 grid size-16 place-items-center rounded-[20px] bg-muted text-accent-text">
        <IconCmp size={30} weight="fill" />
      </span>
      <h3 className="text-xl font-extrabold text-balance font-stretch-semi-expanded">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground text-pretty">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};
