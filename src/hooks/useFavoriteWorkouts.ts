import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/api";

export const useFavoriteWorkouts = () => {
  const queryClient = useQueryClient();

  // Get user's favorite workouts
  const { data: favoriteWorkouts = [], isLoading } = useQuery({
    queryKey: ["favoriteWorkouts"],
    queryFn: async () => {
      const response = await http.get("/auth/favorites/workouts");
      return response.favoriteWorkouts as string[];
    },
  });

  // Toggle favorite status for a workout
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({
      workoutId,
      isFavorite,
    }: {
      workoutId: string;
      isFavorite: boolean;
    }) => {
      const action = isFavorite ? "remove" : "add";
      return await http.post(`/auth/favorites/workouts/${workoutId}`, {
        action,
      });
    },
    onSuccess: () => {
      // Invalidate and refetch favorites
      queryClient.invalidateQueries({ queryKey: ["favoriteWorkouts"] });
    },
  });

  const toggleFavorite = (workoutId: string, currentFavoriteState: boolean) => {
    toggleFavoriteMutation.mutate({
      workoutId,
      isFavorite: currentFavoriteState,
    });
  };

  const isFavorite = (workoutId: string) =>
    favoriteWorkouts.includes(workoutId);

  return {
    favoriteWorkouts,
    isLoading,
    toggleFavorite,
    isFavorite,
    isToggling: toggleFavoriteMutation.isPending,
  };
};
