"use client";
import FeaturedExercisesSection from "@/components/exercises/FeaturedExercisesSection";
import MainSearchInput from "@/components/ui/MainSearchInput";
import SmallBrowseCards from "@/components/workouts/SmallBrowseCards";
import { api, fetchMine } from "@/lib/api";
import { ExerciseApiType, ExerciseType } from "@/types/workout";
import { Edit, LucideIcon, Plus } from "lucide-react";
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
  const [featuredList, setFeaturedList] = useState([]);
  const [libraryList, setLibraryList] = useState<ExerciseApiType[] | null>(
    null
  );
  const [customList, setCustomList] = useState<ExerciseApiType[] | null>(null);

  const router = useRouter();

  // fetch a pool of global+mine, then filter down to tag === "featured"
  const fetchFeatureExercises = async () => {
    const res = await api("/exercises?scope=all&limit=20"); // uses your existing route
    const data = await res.json(); // { items: [...] }
    console.log("data from response: ", data);
    setLibraryList(data.items);
    const featuredPool = (data.items ?? []).filter((w: any) =>
      (w.tags ?? []).includes("featured")
    );

    // shuffle then take 5
    for (let i = featuredPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [featuredPool[i], featuredPool[j]] = [featuredPool[j], featuredPool[i]];
    }
    const featuredFive = featuredPool.slice(0, 5);
    //console.log(featuredFive);
    setFeaturedList(featuredFive);
  };

  const fetchMyExer = async () => {
    const myExerciseList = await fetchMine();
    console.log(myExerciseList);
    setCustomList(myExerciseList.items);
  };

  useEffect(() => {
    fetchFeatureExercises();
    fetchMyExer();
  }, []);
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
      <MainSearchInput />
      <div className="w-full flex flex-col gap-4 items-start">
        <h2 className="font-medium px-4">Custom Made</h2>
        <div className="px-4 pb-4 w-full grid grid-cols-1 min-[375px]:grid-cols-2 md:grid-cols-3 gap-4">
          {customList &&
            customList.map((item, index) => (
              <SmallBrowseCards
                key={index}
                title={item.title}
                subtitle={item.type}
                imgUrl={item.image}
                action={true}
                route={`/exercisepreview/${item.id}`}
              />
            ))}
        </div>
      </div>
      <div className="w-full flex flex-col gap-4 items-start">
        <h2 className="font-medium px-4">Library</h2>
        <div className="px-4 pb-4 w-full grid grid-cols-1 min-[375px]:grid-cols-2 md:grid-cols-3 gap-4">
          {libraryList &&
            libraryList.map((item, index) => (
              <SmallBrowseCards
                key={index}
                title={item.title}
                subtitle={item.type}
                imgUrl={item.image}
                action={true}
                route={`/exercisepreview/${item.id}`}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default page;
