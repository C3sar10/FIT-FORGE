import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import MainSearchInput from "./MainSearchInput";
import SmallBrowseCards from "../workouts/SmallBrowseCards";
import { WorkoutBrowseDefault } from "@/lib/workouts/WorkoutsLists";

type Props = {};

const BrowseSearchContainer = (props: Props) => {
  const { theme, setTheme } = useTheme();
  const [isLight, setIsLight] = useState(theme === "light");

  useEffect(() => {
    setIsLight(theme === "light");
  }, [theme]);

  return (
    <div className="w-full h-full flex flex-col gap-0">
      <MainSearchInput />
      <div className="px-4 pb-4 w-full grid grid-cols-1 min-[375px]:grid-cols-2 md:grid-cols-3 gap-4">
        {WorkoutBrowseDefault.map((item, index) => (
          <SmallBrowseCards
            key={index}
            title={item.title}
            Icon={item.icon}
            subtitle={item.subtitle}
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
