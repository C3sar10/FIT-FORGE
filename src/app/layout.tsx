// src/app/layout.tsx
import "../styles/globals.css";
import { Metadata } from "next";
import { roboto } from "@/lib/fonts";
import "@/lib/amplify";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "FitForge",
  description:
    "Track your workouts, log sessions, and build schedules for your fitness journey.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={roboto.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
