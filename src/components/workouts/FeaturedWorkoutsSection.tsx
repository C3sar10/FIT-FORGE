import React, { useEffect, useState } from "react";
import LargeFeatureCards from "../ui/LargeFeatureCards";
import { api } from "@/lib/api";

type Props = {};

interface FeaturedItem {
  id: string;
  image?: string;
  isFavorite: boolean;
  name: string;
  tags: string[];
}

const FeaturedWorkoutsSection = (props: Props) => {
  const [featuredList, setFeaturedList] = useState([]);

  // fetch a pool of global+mine, then filter down to tag === "featured"
  const fetchFeatureWorkouts = async () => {
    const res = await api("/workouts?scope=all&limit=50"); // uses your existing route
    const data = await res.json(); // { items: [...] }
    console.log("data from response: ", data);
    const featuredPool = (data.items ?? []).filter((w: any) =>
      (w.tags ?? []).includes("featured")
    );

    // shuffle then take 5
    for (let i = featuredPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [featuredPool[i], featuredPool[j]] = [featuredPool[j], featuredPool[i]];
    }
    const featuredFive = featuredPool.slice(0, 5);
    console.log(featuredFive);
    setFeaturedList(featuredFive);
  };

  useEffect(() => {
    fetchFeatureWorkouts();
  }, []);

  return (
    <div className="w-full flex flex-col gap-2 items-start">
      <div className="px-4">
        <h2 className="font-medium text-2xl md:text-4xl">Featured Workouts</h2>
      </div>
      <div className="w-full h-fit px-4">
        <div className="w-full flex items-center gap-4 overflow-x-scroll no-scrollbar h-[150px] min-[375px]:h-[180px] md:h-[220px] lg:h-[280px]">
          {featuredList.map((item: FeaturedItem) => (
            <LargeFeatureCards
              key={item.id}
              title={item.name}
              tags={item.tags}
              imageUrl={item.image}
              id={item.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedWorkoutsSection;
