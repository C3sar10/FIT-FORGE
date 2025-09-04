import FooterNavigation from "@/components/ui/FooterNavigation";
import { FooterMenuList, FooterNav } from "@/types/nav";
import { Dumbbell } from "lucide-react";
import { CalendarCheck } from "lucide-react";
import { NotebookText } from "lucide-react";
import { ChartLine } from "lucide-react";
import { BicepsFlexed } from "lucide-react";

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
    id: 1,
    linkTo: "startWorkoutMenu",
    subMenu: true,
  },
  {
    name: "Log a workout",
    id: 2,
    linkTo: "/progress",
    subMenu: false,
  },
  {
    name: "Create New Workout",
    id: 3,
    linkTo: "/workouts",
    subMenu: false,
  },
  {
    name: "Create New Plan",
    id: 4,
    linkTo: "/plans",
    subMenu: false,
  },
];
