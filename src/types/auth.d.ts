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

export interface User {
  id: string;
  name: string;
  passwordHash: string;
  email: string;
  phone: {
    e164: string | null;
    verified: boolean;
  } | null;
  address: {
    street: string | null;
    city: string | null;
    state: string | null;
    zipcode: string | null;
    country: string | null;
  } | null;
  dob: Date | null;
  gender: string | null;
  height: {
    value: number | null;
    unit: string | null;
  } | null;
  weight: {
    value: number | null;
    unit: string | null;
  } | null;
  profilePicture: {
    original: string | null;
    thumbnail: string | null;
    uploadedAt: Date | null;
  };
  favoriteWorkouts?: string[];
  schemaVersion?: number;
}
