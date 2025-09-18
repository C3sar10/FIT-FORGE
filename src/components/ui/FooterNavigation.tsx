import React from "react";
import { Dumbbell } from "lucide-react";
import FooterPlusButton from "./FooterPlusButton";
import { FooterNavList } from "@/lib/nav/FooterNavList";
import { LucideIcon } from "lucide-react";
import { useMenu } from "@/context/MenuContext";
import { usePathname } from "next/navigation";
import Link from "next/link";

type Props = {};

interface NavItemProps {
  IconComponent: LucideIcon | undefined;
  name: string;
  route: string;
  isActive: boolean;
}

const FooterNavItem: React.FC<NavItemProps> = ({
  IconComponent,
  name,
  route,
  isActive,
}) => {
  return (
    <Link href={route} className="w-fit">
      <li
        className={`w-[56px] px-1 py-2 min-[325px]:py-3 min-[390px]:w-[80px] min-[325px]:w-[86px] rounded-lg flex flex-col items-center gap-1 cursor-pointer transition-colors ease-out duration-200
    ${isActive ? "bg-lime-500 text-white" : "bg-transparent hover:bg-lime-700"}
  `}
      >
        {" "}
        {IconComponent ? <IconComponent size={24} /> : <Dumbbell size={24} />}
        <p className="hidden min-[390px]:inline-block text-[10px] min-[325px]:text-[12px] font-medium text-center tracking-[0.4px]">
          {name}
        </p>
      </li>
    </Link>
  );
};

const FooterNavigation = (props: Props) => {
  const { isMenuOpen } = useMenu();
  const pathname = usePathname();
  return (
    <nav
      className={`font-roboto z-50 bg-black text-white px-2 min-[325px]:p-3 pt-4 pb-3 flex items-center justify-center fixed w-full max-w-[900px] bottom-0 left-0 right-0 mx-auto transition-all duration-300 ease-out transform ${
        isMenuOpen ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <ul className="w-full h-full flex items-center justify-between gap-1 min-{325px]:gap-2 max-w-[420px] md:max-w-[600px]">
        {FooterNavList.map((navItem, index) => (
          <FooterNavItem
            name={navItem.name}
            route={navItem.route}
            key={index}
            IconComponent={navItem.icon}
            isActive={pathname === navItem.route}
          />
        ))}
      </ul>
      <FooterPlusButton />
    </nav>
  );
};

export default FooterNavigation;
