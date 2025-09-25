import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import MainSearchInput from "./MainSearchInput";
import SmallBrowseCards from "../workouts/SmallBrowseCards";
import { WorkoutBrowseDefault } from "@/lib/workouts/WorkoutsLists";
import { api } from "@/lib/api";
import { WorkoutApiType } from "@/types/workout";

type Props = {};

const BrowseSearchContainer = (props: Props) => {
  const { theme, setTheme } = useTheme();
  const [isLight, setIsLight] = useState(theme === "light");
  const [customList, setCustomList] = useState<WorkoutApiType[]>([]);

  useEffect(() => {
    setIsLight(theme === "light");
  }, [theme]);

  useEffect(() => {
    console.log("On render, custom workouts: ");
    fetchCustomWorkouts();
  }, []);

  const fetchCustomWorkouts = async () => {
    const res = await api("/workouts?scope=mine&limit=10");
    const myWorkoutList = await res.json();
    console.log("My custom workout List: ", myWorkoutList);
    setCustomList(myWorkoutList.items);
  };

  return (
    <div className="w-full h-full flex flex-col gap-0">
      {customList.length > 0 && (
        <div className="px-4 pt-4 w-full flex flex-col items-start gap-2">
          <h2 className="font-medium ">Custom Made</h2>
          <div className=" w-full flex items-center gap-4 overflow-x-scroll no-scrollbar h-[150px] min-[375px]:h-[180px] md:h-[200px]">
            {customList.map((item, index) => (
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
      <MainSearchInput />
      <div className="px-4 pb-4 w-full grid grid-cols-1 min-[375px]:grid-cols-2 md:grid-cols-3 gap-4">
        {WorkoutBrowseDefault.map((item, index) => (
          <SmallBrowseCards
            key={index}
            title={item.title}
            Icon={item.icon}
            imgUrl={item.imgUrl}
            action={item.action}
            route={item.routeUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default BrowseSearchContainer;
