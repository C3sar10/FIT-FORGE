//import "../styles/globals.css";
import "../styles/globals.css";

import { ThemeProvider } from "next-themes";
import { Metadata } from "next";
import { roboto } from "@/lib/fonts";
import "@/lib/amplify"; // Add this

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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
