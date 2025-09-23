import { ThemeProvider } from "next-themes";
import { Metadata } from "next";
import { roboto } from "@/lib/fonts";
import "@/lib/amplify"; // Add this
import { AuthProvider } from "@/context/AuthContext";
import { WorkoutProvider } from "@/context/WorkoutContext";
import { TimerProvider } from "@/context/TimerContext";
import TimerUiBridge from "@/components/player/TimerUiBridge";
import { DialogProvider } from "@/context/DialogContext";

export const metadata: Metadata = {
  title: "My App",
  description:
    "A Next.js application for users to use in excercising activies and tracking progress.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={roboto.className} suppressHydrationWarning>
      <body className="">
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TimerProvider>
              <WorkoutProvider>
                <DialogProvider>
                  <TimerUiBridge />
                  {children}
                </DialogProvider>
              </WorkoutProvider>
            </TimerProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

