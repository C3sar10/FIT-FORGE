import React from "react";
import { PlusIcon } from "lucide-react";

interface PlanCardProps {
  title: string;
  description: string;
  onClick?: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  title,
  description,
  onClick,
}) => (
  <div className="w-full p-4 flex items-center justify-start text-left gap-8 border-2 rounded-[8px] py-8 hover:shadow-lg hover:scale-[1.02] transition-transform cursor-pointer" onClick={onClick}>
        <PlusIcon size={46} className="text-primary" />
        <div className="w-fit h-full flex flex-col items-center gap-2">
            <h1 className="w-full text-3xl md:text-4xl font-medium text-left">{title}</h1>
            <p className="w-full text-md md:text-lg font-normal text-left">
                {description}
            </p>
        </div>
    </div>
);

export default PlanCard;
