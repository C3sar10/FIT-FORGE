import { LucideIcon } from "lucide-react";

export interface FormList {
  label: string;
  icon?: LucideIcon;
  type:
    | "text"
    | "email"
    | "password"
    | "range"
    | "number"
    | "date"
    | "button"
    | "file"
    | "image"
    | "submit";
  initValue?: string | number | Date | null;
  placeholder: string | null;
}
