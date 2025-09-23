import { Heart, PlusCircle, Redo2 } from "lucide-react";

export const WorkoutBrowseDefault = [
  {
    title: "My Favorites",
    icon: Heart,
    imgUrl: "/favorites-default.jpg",
  },
  {
    title: "New Workout",
    icon: PlusCircle,
    action: true,
    routeUrl: "/build/workout/custom",
  },
  {
    title: "Push/Pull",
    subtitle: "Group",
    imgUrl: "/push-day-default.jpg",
  },
  {
    title: "Recently Done",
    icon: Redo2,
  },
  {
    title: "Workout Library",
    routeUrl: "/dash/workouts/library/exercises",
    action: true,
  },
  {
    title: "Push/Pull/Legs",
    subtitle: "Group",
    imgUrl: "/pull-default.jpg",
  },
  {
    title: "Exercise Library",
    imgUrl: "/exercise-library-default.jpg",
    routeUrl: "/dash/workouts/library/exercises",
    action: true,
  },
  {
    title: "My Workout Groups",
    imgUrl: "/workout-groups-default.jpg",
  },
];
