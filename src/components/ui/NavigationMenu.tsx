import { useTheme } from "next-themes";
import React from "react";
import { X } from "lucide-react";
import { FooterMenuList } from "@/types/nav";
import { FooterPlusNavMenuMain } from "@/lib/nav/FooterNavList";
import { ChevronRight } from "lucide-react";
import { useMenu } from "@/context/MenuContext";
import { useLogGlobal } from "@/context/LogContext";
import { set } from "mongoose";
import { useRouter } from "next/navigation";

type Props = {};

interface subMenu {
  menuName?: string;
  menuList: FooterMenuList[];
}

const SubMenu: React.FC<subMenu> = ({ menuName, menuList }) => {
  const { setIsPostWorkoutLog, setLogOpen } = useLogGlobal();
  const { isMenuOpen, setIsMenuOpen } = useMenu();
  const router = useRouter();

  const handleAction = (menuItemId: string) => {
    if (menuItemId === "startWorkout") {
      console.log("Start a workout action triggered");
    }
    if (menuItemId === "logWorkout") {
      setIsPostWorkoutLog(false);
      setLogOpen(true);
      setIsMenuOpen(false);
      console.log("Log a workout action triggered");
    }
    if (menuItemId === "createWorkout") {
      router.push("/build/workout/custom");
      console.log("Create New Workout action triggered");
    }
    if (menuItemId === "createPlan") {
      console.log("Create New Plan action triggered");
    }
  };

  return (
    <>
      {menuName && <h3 className="text-sm font-medium">{menuName}</h3>}
      <ul className="w-full flex flex-col divide-y divide-full divide-neutral-200">
        {menuList.map((menuItem) => {
          return (
            <li
              onClick={() => handleAction(menuItem.id)}
              key={menuItem.id}
              className="w-full py-4 flex items-center justify-between transition-colors cursor-pointer ease-out duration-200 hover:text-lime-500"
            >
              <span className="text-md font-medium">{menuItem.name}</span>
              <ChevronRight />
            </li>
          );
        })}
      </ul>
    </>
  );
};

const NavigationMenu = (props: Props) => {
  const { resolvedTheme } = useTheme();
  const { isMenuOpen, toggleMenu } = useMenu();

  if (!isMenuOpen) return null;

  const isDark = resolvedTheme === "dark";
  return (
    <div className="w-full z-50 h-full fixed top-0 bottom-0 left-0 right-0 bg-black/40 flex flex-col px-4 items-center justify-end">
      <div
        className={`w-full rounded-lg min-h-[300px] max-w-[800px] ${
          isDark ? "bg-[#1e1e1e] text-white" : "bg-white text-black"
        } flex flex-col gap-2 p-4 transition-all duration-300 ease-out transform ${
          isMenuOpen
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0"
        } ${!isMenuOpen && "duration-200 ease-in"}`}
      >
        <X
          onClick={toggleMenu}
          size={18}
          className="cursor-pointer hover:scale-105 transition-all ease-out duration-200 hover:text-lime-500"
        />
        <div className="w-full h-full">
          <SubMenu menuList={FooterPlusNavMenuMain} />
        </div>
      </div>
    </div>
  );
};

export default NavigationMenu;
