import { FormList } from "@/types/auth";
import { LockKeyholeIcon, Mail, User2 } from "lucide-react";
import { LockKeyhole } from "lucide-react";

export const SignUpFormList: FormList[] = [
  {
    label: "Email Address",
    icon: Mail,
    type: "email",
    initValue: null,
    placeholder: null,
  },
  {
    label: "Password",
    icon: LockKeyhole,
    type: "password",
    initValue: null,
    placeholder: null,
  },
];

export const LoginFormList: FormList[] = [
  {
    label: "Name",
    icon: User2,
    type: "text",
    initValue: null,
    placeholder: null,
  },
  {
    label: "Email Address",
    icon: Mail,
    type: "email",
    initValue: null,
    placeholder: null,
  },
  {
    label: "Password",
    icon: LockKeyhole,
    type: "password",
    initValue: null,
    placeholder: null,
  },
  {
    label: "Confirm Password",
    icon: LockKeyholeIcon,
    type: "password",
    initValue: null,
    placeholder: null,
  },
];
