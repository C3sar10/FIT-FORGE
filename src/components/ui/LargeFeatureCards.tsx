import { span } from "framer-motion/client";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

type Props = {
  title: string;
  tags: string[];
};

const LargeFeatureCards: React.FC<Props> = ({ title, tags }) => {
  const { theme, setTheme } = useTheme();
  const [isLight, setIsLight] = useState(theme === "light");

  useEffect(() => {
    setIsLight(theme === "light");
  }, [theme]);

  return (
    <div
      className={`aspect-video relative h-full w-auto min-h-[160px] cursor-pointer
        ${
          isLight
            ? "bg-neutral-200 border-neutral-200"
            : "bg-white border-neutral-200"
        }      
      rounded-md border `}
    >
      <div className="w-full h-full bg-linear-180 from-black/0 to-black/60"></div>
      <div className="absolute bottom-2 right-2 left-2 w-full flex flex-col items-start text-white">
        <p className="text-base font-medium">{title}</p>
        <p className="text-xs">
          {tags.length === 1
            ? tags[0] + " workout"
            : tags.map((tag, index) => (
                <span key={index} className="capitalize">
                  {tag},{" "}
                </span>
              ))}
        </p>
      </div>
    </div>
  );
};

export default LargeFeatureCards;
