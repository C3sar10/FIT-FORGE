import React, { useState } from "react";
import { UserRound } from "lucide-react";
import { useTheme } from "next-themes";
import { ChevronUp } from "lucide-react";
import { ChevronRight } from "lucide-react";
import ThemeToggle from "./ThemeToggleButton";

type Props = {
  hasDetails: boolean;
};

interface UserMenuProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ isOpen, toggleMenu }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  return (
    <div
      className={`${
        isOpen ? "flex" : "hidden"
      } w-fit min-w-[275px] max-w-[375px] min-h-[200px] absolute top-12 right-0 border rounded-lg p-3 flex-col
        ${
          isDark
            ? "bg-[#1e1e1e] border-neutral-100 text-white"
            : "bg-white border-neutral-100 text-black"
        }

        `}
    >
      <div
        onClick={toggleMenu}
        className="absolute right-2 top-2 cursor-pointer"
      >
        <ChevronUp size={20} />
      </div>
      <div className="w-full py-3 flex flex-col gap-0 border-b border-neutral-100">
        <p className="font-medium text-sm">Francisco Perez</p>
        <p className="text-sm text-neutral-400 truncate">
          fperezfrancisco4@gmail.com
        </p>
        <span className="flex items-center gap-2 pt-2 justify-between">
          <p className="text-sm font-medium">System Theme</p>
          <ThemeToggle />
        </span>
      </div>
      <ul className="w-full flex flex-col divide-y divide-neutral-100">
        <li className="w-full py-3 flex items-center justify-between gap-0 hover:text-lime-500 transition-colors ease-out duration-300 cursor-pointer">
          <p className="font-medium text-sm">Profile</p>
          <ChevronRight size={16} />
        </li>
        <li className="w-full py-3 flex items-center justify-between gap-0 hover:text-lime-500 transition-colors ease-out duration-300 cursor-pointer">
          <p className="font-medium text-sm">Settings</p>
          <ChevronRight size={16} />
        </li>
      </ul>
    </div>
  );
};

const MainHeader: React.FC<Props> = ({ hasDetails }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleUserMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="w-full py-2 px-2 min-[325px]:px-4 h-[64px] flex items-center justify-between border-b border-neutral-100">
      <span className="text-lg font-semibold">FitForge</span>
      {hasDetails && (
        <div className="relative">
          <span
            onClick={toggleUserMenu}
            className="ml-4 size-[40px] flex items-center justify-center bg-lime-100 text-lime-700 rounded-full hover:border-lime-500 cursor-pointer"
          >
            <UserRound size={32} />
          </span>
          <UserMenu isOpen={menuOpen} toggleMenu={toggleUserMenu} />
        </div>
      )}
    </header>
  );
};

export default MainHeader;
