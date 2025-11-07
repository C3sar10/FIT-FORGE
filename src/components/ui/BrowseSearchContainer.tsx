"use client";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import MainSearchInput from "./MainSearchInput";
import SmallBrowseCards from "../workouts/SmallBrowseCards";
import { WorkoutBrowseDefault } from "@/lib/workouts/WorkoutsLists";
import { api } from "@/lib/api";
import { WorkoutType } from "@/types/workout";
import { useQuery } from "@tanstack/react-query";
import ActionButton from "./ActionButton";
import { useRouter } from "next/navigation";
import { Edit, Plus } from "lucide-react";

type Props = {};

const BrowseSearchContainer = (props: Props) => {
  const { theme, setTheme } = useTheme();
  const [isLight, setIsLight] = useState(theme === "light");

  const router = useRouter();

  useEffect(() => {
    setIsLight(theme === "light");
  }, [theme]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { data: allWorkouts, isLoading } = useQuery({
    queryKey: ["workouts", "search", searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        scope: "all",
        limit: "50",
      });

      if (searchQuery.trim()) {
        params.append("query", searchQuery.trim());
      }

      const res = await api(`/workouts?${params.toString()}`);
      const data = await res.json();
      return data.items ?? [];
    },
  });

  const { isLoading: isCustomLoading, data: customWorkouts } = useQuery({
    queryKey: ["workouts", "custom-mine"],
    queryFn: async () => {
      const res = await api("/workouts?scope=mine&limit=10");
      const data = await res.json();
      return data.items ?? [];
    },
  });

  return (
    <div className="w-full h-full flex flex-col gap-0">
      <div className="w-full px-4 mt-4 flex items-center flex-col min-[500px]:flex-row gap-4">
        <ActionButton
          action={() => router.push("/build/workout/custom")}
          name="Custom Workout"
          Icon={Plus}
        />
        <ActionButton name="Modify Existing" Icon={Edit} />
      </div>
      <MainSearchInput
        placeholder="Search for workouts or workout groups"
        onSearch={(query) => {
          setSearchQuery(query);
          setIsSearching(query.trim().length > 0);
        }}
      />
      <div className="px-4 pb-4 w-full grid grid-cols-1 min-[375px]:grid-cols-2 md:grid-cols-3 gap-4">
        {isSearching ? (
          isLoading ? (
            <>
              <div className="col-span-full text-center py-4">Searching...</div>
            </>
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
            <div className="col-span-full text-center py-4 ">
              No workouts found for "{searchQuery}"
            </div>
          )
        ) : (
          WorkoutBrowseDefault.map((item, index) => (
            <SmallBrowseCards
              key={index}
              title={item.title}
              Icon={item.icon}
              imgUrl={item.imgUrl}
              action={item.action}
              route={item.routeUrl}
            />
          ))
        )}
      </div>
      {!isSearching && customWorkouts && customWorkouts.length > 0 && (
        <div className="px-4 pb-4 w-full flex flex-col items-start gap-2">
          <h2 className="font-medium ">Custom Made</h2>
          <div className="pb-4 w-full grid grid-cols-1 min-[375px]:grid-cols-2 md:grid-cols-3 gap-4">
            {isCustomLoading
              ? Array(4)
                  .fill(0)
                  .map((_, index) => <>Loading...</>)
              : customWorkouts.map((item: WorkoutType, index: number) => (
                  <SmallBrowseCards
                    key={index}
                    title={item.name}
                    imgUrl={item.image}
                    action={true}
                    route={`/startworkout/${item.id}`}
                  />
                ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseSearchContainer;
