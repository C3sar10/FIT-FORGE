"use client";

import { ThemeProvider } from "next-themes";
import { Metadata } from "next";
import PageContainer from "@/components/ui/PageContainer";
import FooterNavigation from "@/components/ui/FooterNavigation";
import { useState } from "react";
import NavigationMenu from "@/components/ui/NavigationMenu";
import { MenuProvider } from "@/context/MenuContext";
import MainHeader from "@/components/ui/MainHeader";
import WorkoutPlayer from "@/components/player/WorkoutPlayer";
import WorkoutMiniPlayer from "@/components/player/WorkoutMiniPlayer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MenuProvider>
      <PageContainer>
        <MainHeader hasDetails={true} />
        <main className="w-full h-full min-h-dvh pb-[100px]">{children}</main>
        <NavigationMenu />
        <FooterNavigation />
        <WorkoutPlayer />
      </PageContainer>
    </MenuProvider>
  );
}
