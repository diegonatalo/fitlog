import { useRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useFocusTrap } from "./use-focus-trap";

const Dialog = ({ onClose }: { onClose: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, onClose);
  return (
    <div ref={ref} role="dialog">
      <button>first</button>
      <input aria-label="middle" />
      <button>last</button>
    </div>
  );
};

const Harness = ({ onClose = () => {} }: { onClose?: () => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>open</button>
      {open && (
        <Dialog
          onClose={() => {
            onClose();
            setOpen(false);
          }}
        />
      )}
    </>
  );
};

describe("useFocusTrap", () => {
  it("focuses the first control when the dialog opens", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByText("open"));
    expect(screen.getByText("first")).toHaveFocus();
  });

  it("wraps Tab from the last control to the first and back", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByText("open"));
    screen.getByText("last").focus();
    await userEvent.tab();
    expect(screen.getByText("first")).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(screen.getByText("last")).toHaveFocus();
  });

  it("closes on Escape and gives focus back to the opener", async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    const opener = screen.getByText("open");
    await userEvent.click(opener);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(opener).toHaveFocus();
  });
});
