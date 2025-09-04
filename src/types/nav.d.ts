import { LucideIcon } from "lucide-react";

export interface FooterNav {
  name: string;
  icon?: LucideIcon;
  link?: string;
}

export interface FooterMenuList {
  name: string;
  id: number;
  icon?: LucideIcon;
  subMenu: boolean;
  linkTo: string;
}
