// src/components/timer/TimerUiBridge.tsx
"use client";
import { useSyncTimerToUI } from "@/hooks/useSyncTimerToUI";

export default function TimerUiBridge() {
  useSyncTimerToUI();
  return null;
}
