"use client";
import SmallBrowseCards from "@/components/workouts/SmallBrowseCards";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { WorkoutType } from "@/types/workout";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";
import { useFavoriteWorkouts } from "@/hooks/useFavoriteWorkouts";

type Props = {};

const page = (props: Props) => {
  const router = useRouter();
  const { favoriteWorkouts: favoriteWorkoutIds, isLoading: favoritesLoading } =
    useFavoriteWorkouts();

  // Fetch all workouts to filter by favorites
  const { data: allWorkouts = [], isLoading: workoutsLoading } = useQuery({
    queryKey: ["workouts", "featured-pool"],
    queryFn: async () => {
      const res = await api("/workouts?scope=all&limit=50");
      const data = await res.json();
      return data.items ?? [];
    },
    staleTime: 5 * 60 * 1000, // avoid noisy refetches
  });

  const favoriteWorkouts = useMemo(() => {
    const favoriteSet = new Set(favoriteWorkoutIds);
    return allWorkouts.filter(
      (w: WorkoutType) => w.id && favoriteSet.has(w.id)
    );
  }, [allWorkouts, favoriteWorkoutIds]);

  const isLoading = favoritesLoading || workoutsLoading;

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full px-4 p-4 flex items-center gap-4">
        <ArrowLeft
          className="hover:text-lime-500 cursor-pointer"
          size={24}
          onClick={() => router.back()}
        />
        <h1 className="text-2xl font-medium">Favorite Workouts</h1>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : favoriteWorkouts && favoriteWorkouts.length > 0 ? (
        <div className="px-4 pb-4 w-full grid grid-cols-1 min-[375px]:grid-cols-2 md:grid-cols-3 gap-4">
          {favoriteWorkouts.map((workout: WorkoutType) => (
            <SmallBrowseCards
              key={workout.id}
              title={workout.name}
              imgUrl={workout.image}
              action={true}
              route={`/startworkout/${workout.id}`}
            />
          ))}
        </div>
      ) : (
        <div>No favorite workouts found</div>
      )}
    </div>
  );
};

export default page;
