import { ThemeProvider } from "next-themes";
import { Metadata } from "next";
import "@/styles/globals.css";

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
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

