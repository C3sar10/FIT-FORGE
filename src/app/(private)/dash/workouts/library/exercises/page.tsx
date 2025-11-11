"use client";
import FeaturedExercisesSection from "@/components/exercises/FeaturedExercisesSection";
import ActionButton from "@/components/ui/ActionButton";
import MainSearchInput from "@/components/ui/MainSearchInput";
import SmallBrowseCards from "@/components/workouts/SmallBrowseCards";
import { api, fetchMine } from "@/lib/api";
import { ExerciseType } from "@/types/workout";
import { useQuery } from "@tanstack/react-query";
import { Edit, LucideIcon, Plus } from "lucide-react";
import { set } from "mongoose";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Props = {};

const page = (props: Props) => {
  const [featuredList, setFeaturedList] = useState([]);
  const [libraryList, setLibraryList] = useState<ExerciseType[] | null>(null);
  const [customList, setCustomList] = useState<ExerciseType[] | null>(null);

  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { isLoading: isMyExercisesLoading, data: myExercises } = useQuery({
    queryKey: ["myExercises"],
    queryFn: async () => {
      const res = await fetchMine();
      return res.items;
    },
  });

  const { data: searchExercises, isLoading: isSearchLoading } = useQuery({
    queryKey: ["searchExercises", searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        scope: "all",
        limit: "50",
      });

      if (searchQuery.trim()) {
        params.append("query", searchQuery.trim());
      }

      const res = await api(`/exercises?${params.toString()}`);
      const data = await res.json();
      return data.items ?? [];
    },
  });

  const { isLoading: isLibraryExercisesLoading, data: libraryExercises } =
    useQuery({
      queryKey: ["exercisesLibrary"],
      queryFn: async () => {
        const res = await api("/exercises?scope=all&limit=50");
        const resJson = await res.json();
        return resJson.items;
      },
    });

  useEffect(() => {
    if (libraryExercises) {
      const featuredPool = (libraryExercises ?? []).filter((e: ExerciseType) =>
        (e.tags ?? []).includes("featured")
      );

      // shuffle then take 5
      for (let i = featuredPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [featuredPool[i], featuredPool[j]] = [featuredPool[j], featuredPool[i]];
      }
      const featuredFive = featuredPool.slice(0, 5);
      //console.log(featuredFive);
      setFeaturedList(featuredFive);
    }
  }, [libraryExercises]);

  return (
    <div className="w-full h-full flex flex-col items-center">
      <FeaturedExercisesSection featuredList={featuredList} />
      <div className="w-full px-4 flex items-center flex-col min-[500px]:flex-row gap-4">
        <ActionButton
          action={() => router.push("/build/exercise/custom")}
          name="Custom Exercise"
          Icon={Plus}
        />
        <ActionButton name="Modify Existing" Icon={Edit} />
      </div>
      <MainSearchInput
        placeholder="Search for exercises"
        onSearch={(query) => {
          setSearchQuery(query);
          setIsSearching(query.trim().length > 0);
        }}
      />
      {!isSearching && myExercises && myExercises.length > 0 && (
        <div className="w-full flex flex-col gap-4 items-start">
          <h2 className="font-medium px-4">Custom Made</h2>
          <div className="px-4 pb-4 w-full grid grid-cols-1 min-[375px]:grid-cols-2 md:grid-cols-3 gap-4">
            {myExercises.map((item: ExerciseType, index: number) => (
              <SmallBrowseCards
                key={index}
                title={item.title ? item.title : "Untitled Exercise"}
                subtitle={item.type}
                imgUrl={item.image ? item.image : undefined}
                action={true}
                route={`/exercisepreview/${item.id}`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="w-full flex flex-col gap-4 items-start">
        {!isSearching && <h2 className="font-medium px-4">Library</h2>}

        <div className="px-4 pb-4 w-full grid grid-cols-1 min-[375px]:grid-cols-2 md:grid-cols-3 gap-4">
          {isSearching ? (
            isSearchLoading ? (
              <>
                <div className="col-span-full text-center py-4">
                  Searching...
                </div>
              </>
            ) : searchExercises && searchExercises.length > 0 ? (
              searchExercises.map((item: ExerciseType, index: number) => (
                <SmallBrowseCards
                  key={index}
                  title={item.title ? item.title : "Untitled Exercise"}
                  subtitle={item.type}
                  imgUrl={item.image ? item.image : undefined}
                  action={true}
                  route={`/exercisepreview/${item.id}`}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-4 ">
                No exercises found for "{searchQuery}"
              </div>
            )
          ) : isLibraryExercisesLoading ? (
            <>Loading...</>
          ) : (
            libraryExercises &&
            libraryExercises.map((item: ExerciseType, index: number) => (
              <SmallBrowseCards
                key={index}
                title={item.title ? item.title : "Untitled Exercise"}
                subtitle={item.type}
                imgUrl={item.image ? item.image : undefined}
                action={true}
                route={`/exercisepreview/${item.id}`}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default page;
