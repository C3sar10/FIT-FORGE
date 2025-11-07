import { Heart, PlusCircle, Redo2 } from "lucide-react";

export const WorkoutBrowseDefault = [
  {
    title: "My Favorites",
    icon: Heart,
    imgUrl: "/browse-web/favorites-default.webp",
    routeUrl: "/dash/workouts/favorites",
    action: true,
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
    imgUrl: "/browse-web/workout-library-default.webp",
  },
  {
    title: "Exercise Library",
    imgUrl: "/browse-web/exercise-library-default.webp",
    routeUrl: "/dash/workouts/library/exercises",
    action: true,
  },
  {
    title: "My Workout Groups",
    imgUrl: "/browse-web/workout-groups-default.webp",
  },
];
