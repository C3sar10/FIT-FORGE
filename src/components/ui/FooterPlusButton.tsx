import React from "react";
import { Plus } from "lucide-react";
import { useMenu } from "@/context/MenuContext";

type Props = {};

const FooterPlusButton = (props: Props) => {
  const { toggleMenu } = useMenu();
  return (
    <div
      onClick={toggleMenu}
      className="absolute z-50 -top-7 bg-white text-black size-12 sm:size-14 p-2 rounded-full shadow-xl flex items-center justify-center cursor-pointer hover:bg-lime-100 transition-colors ease-out duration-200 border border-black"
    >
      <Plus size={40} />
    </div>
  );
};

export default FooterPlusButton;
