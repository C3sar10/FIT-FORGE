import React from "react";

interface StatsCardProps {
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  format?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  value,
  icon,
  description,
  format,
}) => (
  <div className="w-full h-full flex flex-col items-start justify-center rounded-[8px] border-2 border-white p-4 bg-zinc-800">
    {icon && <div className="mb-2 text-3xl">{icon}</div>}
    <div className="text-3xl font-bold text-primary my-2">{value} {format}</div>
    {description && (
      <div className="text-lg text-gray-500 dark:text-gray-400">{description}</div>
    )}
  </div>
);

export default StatsCard;