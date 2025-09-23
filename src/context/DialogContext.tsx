// src/context/DialogContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

type DialogAction = {
  id: string; // e.g., "confirm", "cancel", "delete"
  label: string; // button text
  variant?: "primary" | "secondary" | "danger";
};

type DialogOptions = {
  title?: string;
  message?: string | React.ReactNode;
  actions?: [DialogAction] | [DialogAction, DialogAction]; // 1 or 2 buttons
  dismissible?: boolean; // click outside or ESC closes (defaults true)
};

type PendingDialog = DialogOptions & {
  resolve: (result: string | null) => void; // resolves with clicked action id or null
};

type DialogContextType = {
  showDialog: (opts: DialogOptions) => Promise<string | null>;
  closeDialog: (result?: string | null) => void;
};

const DialogContext = createContext<DialogContextType | null>(null);

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used within DialogProvider");
  return ctx;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingDialog | null>(null);
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setMounted(true), []);

  const showDialog = useCallback((opts: DialogOptions) => {
    return new Promise<string | null>((resolve) => {
      setPending({
        title: opts.title,
        message: opts.message,
        actions: (opts.actions ?? [
          { id: "ok", label: "OK", variant: "primary" },
        ]) as PendingDialog["actions"],
        dismissible: opts.dismissible ?? true,
        resolve,
      });
    });
  }, []);

  const closeDialog = useCallback((result: string | null = null) => {
    setPending((prev) => {
      if (prev) prev.resolve(result);
      return null;
    });
  }, []);

  // Esc to close (if dismissible)
  useEffect(() => {
    if (!pending) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && pending.dismissible) closeDialog(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending, closeDialog]);

  // Basic focus management: focus first button when opened
  const firstBtnRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (pending && firstBtnRef.current) {
      firstBtnRef.current.focus();
    }
  }, [pending]);

  return (
    <DialogContext.Provider value={{ showDialog, closeDialog }}>
      {children}

      {mounted &&
        createPortal(
          <GeneralDialog
            open={!!pending}
            title={pending?.title}
            message={pending?.message}
            actions={pending?.actions}
            dismissible={pending?.dismissible ?? true}
            onAction={(id) => closeDialog(id)}
            onDismiss={() => pending?.dismissible && closeDialog(null)}
            firstBtnRef={firstBtnRef}
            overlayRef={overlayRef}
          />,
          document.body
        )}
    </DialogContext.Provider>
  );
}

/** ===== GeneralDialog (UI only) ===== */
function GeneralDialog({
  open,
  title,
  message,
  actions,
  dismissible,
  onAction,
  onDismiss,
  firstBtnRef,
  overlayRef,
}: {
  open: boolean;
  title?: string;
  message?: React.ReactNode;
  actions?: [DialogAction] | [DialogAction, DialogAction];
  dismissible: boolean;
  onAction: (id: string) => void;
  onDismiss: () => void;
  firstBtnRef: React.MutableRefObject<HTMLButtonElement | null>;
  overlayRef: React.MutableRefObject<HTMLDivElement | null>;
}) {
  // Tailwind transitions: fade overlay + scale/translate card
  return (
    <div
      aria-hidden={!open}
      className={clsx(
        "fixed inset-0 z-[120]",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={() => dismissible && onDismiss()}
        className={clsx(
          "fixed inset-0 bg-black/50 backdrop-blur-[1px] transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Dialog card wrapper */}
      <div
        className={clsx(
          "fixed inset-0 flex items-center justify-center px-4 sm:px-6",
          "transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
        role="dialog"
        aria-modal="true"
      >
        <div
          className={clsx(
            "w-full max-w-md min-h-[200px] rounded-2xl bg-neutral-900 text-white",
            "p-4 sm:p-6 shadow-2xl border border-neutral-800",
            "transition-transform duration-200 ease-out",
            open ? "translate-y-0 scale-100" : "translate-y-2 scale-95"
          )}
        >
          {/* Title + message */}
          <div className="space-y-2">
            {title && (
              <h2 className="text-lg sm:text-xl font-semibold tracking-wide">
                {title}
              </h2>
            )}
            {message && (
              <div className="text-sm sm:text-base text-neutral-200 leading-relaxed">
                {message}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 sm:mt-8 flex items-center justify-end gap-2">
            {(actions ?? [{ id: "ok", label: "OK", variant: "primary" }]).map(
              (btn, idx) => (
                <button
                  key={btn.id}
                  ref={idx === 0 ? firstBtnRef : null}
                  onClick={() => onAction(btn.id)}
                  className={clsx(
                    "min-w-[96px] h-10 px-4 rounded-xl text-sm font-medium transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900",
                    btn.variant === "danger" &&
                      "bg-red-700 hover:bg-red-600 focus:ring-red-400",
                    btn.variant === "secondary" &&
                      "bg-neutral-700 hover:bg-neutral-600 focus:ring-neutral-400",
                    (!btn.variant || btn.variant === "primary") &&
                      "bg-lime-600 hover:bg-lime-500 focus:ring-lime-300"
                  )}
                >
                  {btn.label}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeneralDialog;
