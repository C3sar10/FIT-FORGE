import { ThemeProvider } from "next-themes";
import { Metadata } from "next";
import PageContainer from "@/components/ui/PageContainer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageContainer>
      <div className="p-4 border-amber-200 border">Header component</div>
      <main className="w-full h-full min-h-dvh border-green-400 border">
        {children}
      </main>
      <div className="fixed w-full max-w-[900px] bottom-0 left-0 right-0 mx-auto p-4 border border-red-400">
        Footer nav
      </div>
    </PageContainer>
  );
}
