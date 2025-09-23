"use client";
import React from "react";
import MainSearchInput from "../ui/MainSearchInput";
import SmallBrowseCards from "../workouts/SmallBrowseCards";

type Props = {};

const BrowseLibraryContainer = (props: Props) => {
  return (
    <div className="w-full h-full flex flex-col gap-0">
      <MainSearchInput />
      <div className="px-4 pb-4 w-full grid grid-cols-1 min-[375px]:grid-cols-2 md:grid-cols-3 gap-4"></div>
    </div>
  );
};

export default BrowseLibraryContainer;
