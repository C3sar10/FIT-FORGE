"use client";
import { createContext, useContext, useState } from "react";

type EventCtx = {
  eventModalOpen: boolean;
  openEventModal: () => void;
  closeEventModal: () => void;
};

const Ctx = createContext<EventCtx | null>(null);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [eventModalOpen, setEventModalOpen] = useState(false);

  const openEventModal = () => setEventModalOpen(true);
  const closeEventModal = () => setEventModalOpen(false);

  return (
    <Ctx.Provider value={{ eventModalOpen, openEventModal, closeEventModal }}>
      {children}
    </Ctx.Provider>
  );
}

export const useEvent = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useEvent must be used within <EventProvider>");
  return ctx;
};
