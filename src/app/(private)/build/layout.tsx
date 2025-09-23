"use client";

import MainHeader from "@/components/ui/MainHeader";
import PageContainer from "@/components/ui/PageContainer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageContainer>
      <MainHeader hasDetails={true} />
      <main className="w-full h-full min-h-dvh pb-[100px]">{children}</main>
    </PageContainer>
  );
}
