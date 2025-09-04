"use client";

import { ThemeProvider } from "next-themes";
import { Metadata } from "next";
import PageContainer from "@/components/ui/PageContainer";
import FooterNavigation from "@/components/ui/FooterNavigation";
import { useState } from "react";
import NavigationMenu from "@/components/ui/NavigationMenu";
import { MenuProvider } from "@/context/MenuContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MenuProvider>
      <PageContainer>
        <div className="p-4 border-amber-200 border">Header component</div>
        <main className="w-full h-full min-h-dvh border-green-400 border">
          {children}
        </main>
        <NavigationMenu />
        <FooterNavigation />
      </PageContainer>
    </MenuProvider>
  );
}
