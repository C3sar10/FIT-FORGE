import React from "react";

type Props = {};

const SkeletonExerciseLi = (props: Props) => {
  return (
    <li className="w-full h-12 p-2 rounded-md border border-neutral-200 bg-neutral-400 animate-pulse cursor-pointer flex items-center justify-between"></li>
  );
};

export default SkeletonExerciseLi;
