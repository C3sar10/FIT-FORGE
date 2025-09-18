import { p } from "framer-motion/client";
import { LucideIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import React, { useEffect, useState } from "react";

type CardProps = {
  title: string;
  Icon?: LucideIcon | null;
  subtitle?: string | null;
  imgUrl?: string;
};

const SmallBrowseCards: React.FC<CardProps> = ({
  title,
  Icon,
  subtitle,
  imgUrl,
}) => {
  const { theme, setTheme } = useTheme();
  const [isLight, setIsLight] = useState(theme === "light");

  useEffect(() => {
    setIsLight(theme === "light");
  }, [theme]);
  return (
    <div
      className={`aspect-[3/2] relative h-full w-auto cursor-pointer bg-linear-180 from-black to-lime-500 rounded-md border `}
    >
      {imgUrl && (
        <img
          src={imgUrl}
          className="absolute w-full h-full object-cover -z-0"
          alt="image"
        />
      )}
      <div className="w-full absolute z-10 h-full bg-linear-180 from-black/0 to-black/60"></div>
      <div className="absolute z-20 bottom-2 right-2 left-2 w-full flex flex-col items-start text-white">
        {Icon && <Icon size={24} />}{" "}
        <p className="text-base font-medium">{title}</p>
        {subtitle && <p className="text-xs">{subtitle}</p>}
      </div>
    </div>
  );
};

export default SmallBrowseCards;
