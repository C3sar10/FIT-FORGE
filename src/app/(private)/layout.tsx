// src/app/(private)/layout.tsx
"use client";
import WorkoutLogModal from "@/components/logs/WorkoutLogModal";
import WorkoutPlayer from "@/components/player/WorkoutPlayer";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
  }, [loading, user, router]);

  if (loading) return null; // or a centered spinner/skeleton
  return (
    <>
      {user ? (
        <>
          {children}
          <WorkoutLogModal />
        </>
      ) : null}
    </>
  );
}
