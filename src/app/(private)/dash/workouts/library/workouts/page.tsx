"use client";
import FeaturedExercisesSection from "@/components/exercises/FeaturedExercisesSection";
import MainSearchInput from "@/components/ui/MainSearchInput";
import FeaturedWorkoutsSection from "@/components/workouts/FeaturedWorkoutsSection";
import SmallBrowseCards from "@/components/workouts/SmallBrowseCards";
import { api, fetchMine, http } from "@/lib/api";
import { ExerciseType, WorkoutType } from "@/types/workout";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit, LucideIcon, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Props = {};

interface ActionButtonProps {
  name: string;
  Icon: LucideIcon | null;
  action?: () => void;
}

interface FeaturedItem {
  id: string;
  image?: string;
  isFavorite: boolean;
  title: string;
  tags: string[];
  description: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ name, Icon, action }) => {
  return (
    <button
      onClick={action}
      className="w-full p-4 rounded-2xl hover:bg-[#1e1e1e] bg-black text-white flex items-center justify-center gap-2 text-center font-medium tracking-wider text-sm sm:text-base"
    >
      {Icon && <Icon size={18} />} {name}
    </button>
  );
};

const page = (props: Props) => {
  const router = useRouter();
  const limit = 10;

  // State management
  const [workoutLibrary, setWorkoutLibrary] = useState<WorkoutType[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Initial load query - only runs once on component mount
  const { data: initialData, isLoading: isInitialLoading } = useQuery({
    queryKey: ["workouts", "initial"],
    queryFn: async () => {
      const res = await http.get(`/workouts?scope=all&limit=${limit}`);
      return res;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Search query - runs when search query changes
  const { data: allWorkouts, isLoading: isSearchLoading } = useQuery({
    queryKey: ["workouts", "search", searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        scope: "all",
        limit: "50", // Higher limit for search results
      });

      if (searchQuery.trim()) {
        params.append("query", searchQuery.trim());
      }

      const res = await api(`/workouts?${params.toString()}`);
      const data = await res.json();
      return data.items ?? [];
    },
    enabled: isSearching, // Only run when searching
  });

  // Load more function with proper error handling
  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore || !nextCursor) return;

    //console.log("Loading more workouts with cursor:", nextCursor);
    setIsLoadingMore(true);
    try {
      const res = await http.get(
        `/workouts?scope=all&limit=${limit}&cursor=${nextCursor}`
      );

      console.log(
        "Received new items:",
        res.items?.length,
        "Next cursor:",
        res.pagination?.nextCursor
      );

      if (res.items && res.items.length > 0) {
        setWorkoutLibrary((prev) => {
          // Create a Set of existing IDs to prevent duplicates
          const existingIds = new Set(prev.map((item) => item.id));
          const newItems = res.items.filter(
            (item: WorkoutType) => !existingIds.has(item.id)
          );

          return [...prev, ...newItems];
        });
        setNextCursor(res.pagination.nextCursor);
        setHasMore(!!res.pagination.nextCursor);
      } else {
        console.log("No more items to load");
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more workouts:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Initialize library when initial data loads
  useEffect(() => {
    if (initialData?.items) {
      setWorkoutLibrary(initialData.items);
      setNextCursor(initialData.pagination?.nextCursor || null);
      setHasMore(!!initialData.pagination?.nextCursor);
    }
  }, [initialData]);

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full p-4 flex items-center gap-4">
        <ArrowLeft onClick={() => router.back()} />
        <h2 className="font-medium text-2xl md:text-4xl">Workout Library</h2>
      </div>
      <MainSearchInput
        onSearch={(query) => {
          setSearchQuery(query);
          setIsSearching(query.trim().length > 0);

          // Reset pagination when starting/ending search
          if (
            query.trim().length === 0 &&
            workoutLibrary.length === 0 &&
            initialData?.items
          ) {
            // Restore initial data when clearing search
            setWorkoutLibrary(initialData.items);
            setNextCursor(initialData.pagination?.nextCursor || null);
            setHasMore(!!initialData.pagination?.nextCursor);
          }
        }}
      />
      <div className="px-4 pb-4 w-full grid grid-cols-1 min-[375px]:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Initial Loading State */}
        {isInitialLoading && (
          <div className="col-span-full text-center py-8">
            <div className="animate-pulse">Loading workouts...</div>
          </div>
        )}

        {/* Search Results */}
        {isSearching && (
          <>
            {isSearchLoading ? (
              <div className="col-span-full text-center py-4">Searching...</div>
            ) : allWorkouts && allWorkouts.length > 0 ? (
              allWorkouts.map((workout: WorkoutType, index: number) => (
                <SmallBrowseCards
                  key={workout.id || index}
                  title={workout.name}
                  imgUrl={workout.image}
                  action={true}
                  route={`/startworkout/${workout.id}`}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-4">
                No workouts found for "{searchQuery}"
              </div>
            )}
          </>
        )}

        {/* Regular Library View */}
        {!isSearching && !isInitialLoading && (
          <>
            {workoutLibrary.length > 0 ? (
              workoutLibrary.map((workout: WorkoutType) => (
                <SmallBrowseCards
                  key={workout.id}
                  title={workout.name}
                  imgUrl={workout.image}
                  subtitle={workout.type}
                  action={true}
                  route={`/startworkout/${workout.id}`}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-neutral-500">No workouts available</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Load More Button - Only show when not searching and there are more items */}
      {!isSearching && hasMore && workoutLibrary.length > 0 && (
        <div className="w-full px-4 pb-4 flex items-center gap-4">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="w-full p-4 bg-black text-white rounded-2xl border border-neutral-200 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoadingMore ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Loading more...
              </div>
            ) : (
              `Load More (${workoutLibrary.length} loaded)`
            )}
          </button>
        </div>
      )}

      {/* No More Items Message */}
      {!isSearching && !hasMore && workoutLibrary.length > 0 && (
        <div className="w-full px-4 pb-4 text-center text-neutral-500">
          <p>You've seen all available workouts! </p>
        </div>
      )}
    </div>
  );
};

export default page;
