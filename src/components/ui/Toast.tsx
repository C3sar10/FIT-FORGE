"use client";
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";

type Props = {
  open: boolean;
  message: string;
  variant?: "success" | "error" | "info";
  autoCloseMs?: number;
  onClose?: () => void;
};

export default function Toast({
  open,
  message,
  variant = "info",
  autoCloseMs = 4000,
  onClose,
}: Props) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    setVisible(open);
    if (open) {
      const t = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, autoCloseMs);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open && !visible) return null;

  const bg = theme === "light" ? "bg-white" : "bg-[#1e1e1e]";
  const text =
    variant === "error"
      ? "text-red-600"
      : variant === "success"
      ? "text-lime-500"
      : "text-neutral-800";

  return (
    <div
      className={`fixed w-full left-1/2 top-4 z-50 -translate-x-1/2 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`${bg} border w-full max-w-[300px] mx-auto border-neutral-200 rounded-2xl p-4 shadow-sm`}
      >
        <h2 className={`text-base font-medium ${text}`}>{message}</h2>
        <div className={`text-sm`}>{message}</div>
      </div>
    </div>
  );
}
