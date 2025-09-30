// src/components/Providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import { WorkoutProvider } from "@/context/WorkoutContext";
import { TimerProvider } from "@/context/TimerContext";
import { DialogProvider } from "@/context/DialogContext";
import TimerUiBridge from "@/components/player/TimerUiBridge";
import React from "react";
import { LogProvider } from "@/context/LogContext";
import { EventProvider } from "@/context/EventContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - fresh data, no refetch on nav
      gcTime: 10 * 60 * 1000, // 10 minutes - cache lifetime
      refetchOnWindowFocus: false, // Reduce calls on tab switch
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange // Prevent theme flash
        >
          <TimerProvider>
            <LogProvider>
              <EventProvider>
                <WorkoutProvider>
                  <DialogProvider>
                    <TimerUiBridge />
                    {children}
                  </DialogProvider>
                </WorkoutProvider>
              </EventProvider>
            </LogProvider>
          </TimerProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
