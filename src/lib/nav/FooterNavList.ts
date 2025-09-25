"use client";
import FooterNavigation from "@/components/ui/FooterNavigation";
import { useLogGlobal } from "@/context/LogContext";
import { FooterMenuList, FooterNav } from "@/types/nav";
import { Dumbbell } from "lucide-react";
import { CalendarCheck } from "lucide-react";
import { NotebookText } from "lucide-react";
import { ChartLine } from "lucide-react";
import { BicepsFlexed } from "lucide-react";
import { useRouter } from "next/navigation";

export const FooterNavList: FooterNav[] = [
  {
    name: "Workouts",
    icon: BicepsFlexed,
    route: "/dash/workouts",
  },
  {
    name: "Schedule",
    icon: CalendarCheck,
    route: "/dash/schedule",
  },
  {
    name: "Plans",
    icon: NotebookText,
    route: "/dash/plans",
  },
  {
    name: "Progress",
    icon: ChartLine,
    route: "/dash/progress",
  },
];

export const FooterPlusNavMenuMain: FooterMenuList[] = [
  {
    name: "Start a workout",
    id: "startWorkout",
    linkTo: "startWorkoutMenu",
    subMenu: true,
    //action: () => router.push
  },
  {
    name: "Log a workout",
    id: "logWorkout",
    linkTo: "/progress",
    subMenu: false,
  },
  {
    name: "Create New Workout",
    id: "createWorkout",
    linkTo: "/workouts",
    subMenu: false,
  },
  {
    name: "Create New Plan",
    id: "createPlan",
    linkTo: "/plans",
    subMenu: false,
  },
];
