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
  <div className="w-full h-full flex flex-col items-start justify-center rounded-md border border-neutral-200 p-4">
    {icon && <div className="mb-2 text-4xl">{icon}</div>}
    <div className="text-2xl md:text-3xl font-medium leading-tight text-primary">
      {value} {format}
    </div>
    {description && (
      <div className="text-lg text-neutral-400">{description}</div>
    )}
  </div>
);

export default StatsCard;
