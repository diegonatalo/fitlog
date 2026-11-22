import { useRef, type ReactNode } from "react";
import { useFocusTrap } from "@/hooks/use-focus-trap";

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Campos entre o texto e os botões (ex.: a senha para excluir a conta); Enter confirma. */
  children?: ReactNode;
  confirmDisabled?: boolean;
};

export const ConfirmDialog = ({
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  children,
  confirmDisabled = false,
}: ConfirmDialogProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, onCancel);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!confirmDisabled) onConfirm();
          }}
        >
          <h2 className="text-lg font-bold text-balance">{title}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground text-pretty">
            {description}
          </p>
          {children && <div className="mt-4">{children}</div>}
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl border border-border bg-background py-3 font-semibold text-foreground hover:bg-muted"
            >
              {cancelLabel}
            </button>
            <button
              type="submit"
              disabled={confirmDisabled}
              className="flex-1 rounded-xl bg-destructive py-3 font-bold text-destructive-foreground hover:opacity-90 disabled:opacity-50"
            >
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
