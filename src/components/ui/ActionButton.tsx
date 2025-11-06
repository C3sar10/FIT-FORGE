import { LucideIcon } from "lucide-react";
import React from "react";

interface ActionButtonProps {
  name: string;
  Icon: LucideIcon | null;
  action?: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ name, Icon, action }) => {
  return (
    <button
      onClick={action}
      className="w-full p-4 rounded-2xl hover:bg-[#1e1e1e] bg-black text-white flex items-center justify-center gap-2 text-center font-medium tracking-wider text-sm sm:text-base"
    >
      {Icon && <Icon size={18} />} {name}
    </button>
  );
};

export default ActionButton;
