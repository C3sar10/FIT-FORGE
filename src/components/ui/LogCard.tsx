import React from "react";

interface LogCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  img?: string;
  action?: () => void;
}

const LogCard: React.FC<LogCardProps> = ({
  icon,
  title,
  description,
  img,
  action,
}) => (
  <div
    onClick={action ? action : () => {}}
    className="w-full h-[120px] flex flex-row justify-between items-center rounded-md border border-neutral-200 overflow-hidden"
  >
    <div className="h-full w-full flex flex-row items-center gap-4">
      <div className="aspect-square h-full w-auto">
        <img src={img} alt={title} className="h-full w-full object-cover" />
      </div>

      <div className="w-full h-full flex flex-col items-start justify-center">
        <div className="text-2xl md:text-3xl font-medium text-primary leading-tight">
          {title}
        </div>
        <div className="text-sm md:text-base text-neutral-400">
          {description}
        </div>
      </div>
    </div>
    {icon && <div className="mr-4 text-3xl">{icon}</div>}
  </div>
);

export default LogCard;
