import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

type Props = {};

const LargeSkeletonCards = (props: Props) => {
  return (
    <div
      className={`aspect-video relative h-full w-auto min-h-[140px] cursor-pointer bg-neutral-400 animate-pulse      
  rounded-md border `}
    ></div>
  );
};

export default LargeSkeletonCards;
