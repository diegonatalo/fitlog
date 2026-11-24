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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-[30px] border border-border bg-card p-6 shadow-2xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!confirmDisabled) onConfirm();
          }}
        >
          <h2 className="text-2xl leading-tight font-extrabold text-balance font-stretch-semi-expanded">{title}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground text-pretty">
            {description}
          </p>
          {children && <div className="mt-4">{children}</div>}
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="h-13 flex-1 rounded-2xl border border-input font-bold text-foreground hover:bg-muted"
            >
              {cancelLabel}
            </button>
            <button
              type="submit"
              disabled={confirmDisabled}
              className="h-13 flex-1 rounded-2xl bg-destructive font-extrabold text-destructive-foreground hover:opacity-90 disabled:opacity-50"
            >
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
