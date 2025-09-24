import { Heart, PlusCircle, Redo2 } from "lucide-react";

export const WorkoutBrowseDefault = [
  {
    title: "My Favorites",
    icon: Heart,
    imgUrl: "/favorites-default.webp",
  },
  {
    title: "New Workout",
    icon: PlusCircle,
    action: true,
    routeUrl: "/build/workout/custom",
  },
  {
    title: "Recently Done",
    icon: Redo2,
  },
  {
    title: "Workout Library",
    routeUrl: "/dash/workouts/library/exercises",
    action: true,
    imgUrl: "/workout-library-default.webp",
  },
  {
    title: "Exercise Library",
    imgUrl: "/exercise-library-default.webp",
    routeUrl: "/dash/workouts/library/exercises",
    action: true,
  },
  {
    title: "My Workout Groups",
    imgUrl: "/workout-groups-default.webp",
  },
];
