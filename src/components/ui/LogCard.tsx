import React from "react";

interface LogCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  img?: string;
}

const LogCard: React.FC<LogCardProps> = ({
  icon,
  title,
  description,
  img,
}) => (
  <div className="w-full h-full flex flex-row justify-between items-center rounded-[8px] border-2 border-white bg-zinc-800 overflow-hidden">
    <div className="h-full flex flex-row items-center gap-8">
        {img ? <img src={img} alt={title} className="h-full w-1/5" /> : null}
        <div className="flex flex-col">
            <div className="text-4xl font-bold text-primary my-2">{title}</div>
            <div className="text-xl text-gray-500 dark:text-gray-400">{description}</div>
        </div>
    </div>
    {icon && <div className="mr-4 text-3xl">{icon}</div>}
  </div>
);

export default LogCard;