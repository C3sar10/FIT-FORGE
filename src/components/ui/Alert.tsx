// src/components/ui/Alert.tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose?: () => void;
  title?: string;
  message: string;
  variant?: "error" | "success" | "info" | "warning";
  autoCloseMs?: number; // e.g., 4000
};

const styles: Record<NonNullable<Props["variant"]>, string> = {
  error: "bg-red-600 text-white",
  success: "bg-emerald-600 text-white",
  info: "bg-sky-600 text-white",
  warning: "bg-amber-600 text-black",
};

export default function Alert({
  open,
  onClose,
  title,
  message,
  variant = "error",
  autoCloseMs = 4000,
}: Props) {
  useEffect(() => {
    if (!open || !autoCloseMs) return;
    const t = setTimeout(() => onClose?.(), autoCloseMs);
    return () => clearTimeout(t);
  }, [open, autoCloseMs, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 shadow-lg rounded-lg px-4 py-3 flex items-start gap-3 ${styles[variant]}`}
          role="alert"
          aria-live="polite"
        >
          <div className="flex-1">
            {title && <div className="font-semibold">{title}</div>}
            <div className="text-sm">{message}</div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="opacity-80 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
