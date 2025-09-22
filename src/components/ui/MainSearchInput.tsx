import { Search } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

type Props = {};

const MainSearchInput = (props: Props) => {
  const { theme, setTheme } = useTheme();
  const [isLight, setIsLight] = useState(theme === "light");

  useEffect(() => {
    setIsLight(theme === "light");
  }, [theme]);
  return (
    <div className="w-full relative p-4">
      <input
        type="search"
        className={`w-full px-4 py-2 rounded-2xl border border-neutral-200 ${
          isLight ? "bg-white" : "bg-black"
        }  h-12`}
        placeholder="Search for workouts or workout groups"
      />
      <Search className="size-4 absolute right-8 top-0 bottom-0 my-auto" />
    </div>
  );
};

export default MainSearchInput;
