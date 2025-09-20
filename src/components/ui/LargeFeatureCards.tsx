import { span } from "framer-motion/client";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Props = {
  title: string;
  tags: string[];
  imageUrl?: string;
  id: string;
};

const LargeFeatureCards: React.FC<Props> = ({ title, tags, imageUrl, id }) => {
  const { theme, setTheme } = useTheme();
  const [isLight, setIsLight] = useState(theme === "light");

  const router = useRouter();

  useEffect(() => {
    setIsLight(theme === "light");
  }, [theme]);

  return (
    <div
      onClick={() => router.push(`/startworkout/${id}`)}
      className={`aspect-video relative h-full w-auto min-h-[140px] cursor-pointer
        ${
          isLight
            ? "bg-neutral-200 border-neutral-200"
            : "bg-white border-neutral-200"
        }      
      rounded-md border `}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          className="absolute w-full h-full object-cover -z-0 rounded-md"
          alt="image"
        />
      )}
      <div className="absolute z-0 w-full h-full bg-linear-180 from-black/0 to-black/60 rounded-md"></div>
      <div className="absolute bottom-2 w-fill px-2 flex flex-col items-start text-white overflow-hidden z-10">
        <p className="text-base font-medium truncate">{title}</p>
        <p className="text-xs flex items-center pt-1 gap-1">
          {tags &&
            tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="capitalize font-medium text-white px-2 py-1 bg-[#1e1e1e] rounded-md border border-neutral-200"
              >
                {tag}
              </span>
            ))}
        </p>
      </div>
    </div>
  );
};

export default LargeFeatureCards;
