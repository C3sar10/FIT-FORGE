"use client";

import MainHeader from "@/components/ui/MainHeader";
import PageContainer from "@/components/ui/PageContainer";
import { Switch } from "@headlessui/react";
import React, { FormEvent, useState } from "react";
import { LoginFormList, SignUpFormList } from "@/lib/auth/auth";
import {
  LockKeyholeIcon,
  LockKeyholeOpen,
  LucideIcon,
  Mail,
  User2,
} from "lucide-react";
import { Hash } from "crypto";
import { useRouter } from "next/navigation";

type Props = {};

interface SignUpProps {
  userName: string;
  setUserName: (arg0: string) => void;
  userEmail: string;
  setUserEmail: (arg0: string) => void;
  userPassword: string;
  setUserPassword: (arg0: string) => void;
  userConfirmPassword: string;
  setUserConfirmPassword: (arg0: string) => void;
  rememberMe: boolean;
  setRememberMe: (arg0: boolean) => void;
}

const SignUpForm: React.FC<SignUpProps> = ({
  userName,
  userEmail,
  userPassword,
  userConfirmPassword,
  setUserName,
  setUserEmail,
  setUserPassword,
  setUserConfirmPassword,
  rememberMe,
  setRememberMe,
}) => {
  return (
    <ul className="w-full p-0 flex flex-col gap-4">
      <li className="w-full h-12 relative">
        <input
          required
          type="text"
          name="name"
          className="w-full h-full border border-neutral-200 p-2 flex items-center relative rounded-sm pl-10"
          placeholder={"Name"}
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <label
          htmlFor={"name"}
          className="flex items-center gap-2 absolute left-2 top-0 bottom-0 my-0"
        >
          <User2 />
        </label>
      </li>
      <li className="w-full h-12 relative">
        <input
          required
          type="email"
          name="email"
          className="w-full h-full border border-neutral-200 p-2 flex items-center relative rounded-sm pl-10"
          placeholder={"Email"}
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
        />
        <label
          htmlFor={"email"}
          className="flex items-center gap-2 absolute left-2 top-0 bottom-0 my-0"
        >
          <Mail />
        </label>
      </li>
      <li className="w-full h-12 relative">
        <input
          required
          type="password"
          name="password"
          className="w-full h-full border border-neutral-200 p-2 flex items-center relative rounded-sm pl-10"
          placeholder={"Password"}
          value={userPassword}
          onChange={(e) => setUserPassword(e.target.value)}
        />
        <label
          htmlFor={"password"}
          className="flex items-center gap-2 absolute left-2 top-0 bottom-0 my-0"
        >
          <LockKeyholeOpen />
        </label>
      </li>
      <li className="w-full h-12 relative">
        <input
          required
          type="password"
          name="confirmPassword"
          className="w-full h-full border border-neutral-200 p-2 flex items-center relative rounded-sm pl-10"
          placeholder={"Confirm Password"}
          value={userConfirmPassword}
          onChange={(e) => setUserConfirmPassword(e.target.value)}
        />
        <label
          htmlFor={"confirmPassword"}
          className="flex items-center gap-2 absolute left-2 top-0 bottom-0 my-0"
        >
          <LockKeyholeIcon />
        </label>
      </li>
      <li className="w-full relative flex items-center">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        <label className="ml-2 text-sm">Remember Me</label>
      </li>
    </ul>
  );
};

const LoginForm: React.FC<SignUpProps> = ({
  userName,
  userEmail,
  userPassword,
  userConfirmPassword,
  setUserName,
  setUserEmail,
  setUserPassword,
  setUserConfirmPassword,
  rememberMe,
  setRememberMe,
}) => {
  return (
    <ul className="w-full p-0 flex flex-col gap-4">
      <li className="w-full h-12 relative">
        <input
          required
          type="email"
          name="email"
          className="w-full h-full border border-neutral-200 p-2 flex items-center relative rounded-sm pl-10"
          placeholder={"Email"}
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
        />
        <label
          htmlFor={"email"}
          className="flex items-center gap-2 absolute left-2 top-0 bottom-0 my-0"
        >
          <Mail />
        </label>
      </li>
      <li className="w-full h-12 relative">
        <input
          required
          type="password"
          name="password"
          className="w-full h-full border border-neutral-200 p-2 flex items-center relative rounded-sm pl-10"
          placeholder={"Password"}
          value={userPassword}
          onChange={(e) => setUserPassword(e.target.value)}
        />
        <label
          htmlFor={"password"}
          className="flex items-center gap-2 absolute left-2 top-0 bottom-0 my-0"
        >
          <LockKeyholeOpen />
        </label>
      </li>
      <li className="w-full relative flex items-center">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        <label className="ml-2 text-sm">Remember Me</label>
      </li>
    </ul>
  );
};

const page = (props: Props) => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleLogin = () => {
    setIsLogin(!isLogin);
  };

  const route = useRouter();

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userConfirmPassword, setUserConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    //handle
    console.log("User items: ", {
      userName: userName,
      userEmail: userEmail,
      userPassword: userPassword.length,
      confirmPassword: userConfirmPassword.length,
      rememberMe: rememberMe,
    });

    try {
      if (isLogin) {
        if (!userEmail || userEmail === "") {
          throw new Error("Missing Email field");
        } else if (!userPassword || userPassword === "") {
          throw new Error("Missing Password field");
        } else if (userPassword.length < 6) {
          throw new Error("Password length is too short");
        } else {
          route.push("/dash/workouts");
        }
      } else {
        if (!userName || userName === "") {
          throw new Error("Missing Name field");
        } else if (!userEmail || userEmail === "") {
          throw new Error("Missing Email field");
        } else if (!userPassword || userPassword === "") {
          throw new Error("Missing Password field");
        } else if (userPassword.length < 6) {
          throw new Error("Password length is too short");
        } else if (userPassword != userConfirmPassword) {
          throw new Error("Passwords do not match");
        } else {
          route.push("/dash/workouts");
        }
      }
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof Error) {
        return alert(`An error occured: ${error.message}`);
      } else {
        return alert(`An error occured: ${String(error)}`);
      }
    }
  };

  return (
    <PageContainer>
      <MainHeader hasDetails={false} />
      <div className="w-full p-4 pt-8 lg:pt-12 flex flex-col gap-4 items-center max-w-[500px] mx-auto my-0">
        <div className="flex flex-col w-full h-fit text-center gap-2">
          <h1 className="text-5xl xl:text-6xl text-center">
            {isLogin ? "Welcome Back!" : "Welcome to FitForge!"}
          </h1>
          <p className="py-4 text-lg xl:text-xl text-pretty">
            {isLogin
              ? "Let's keep crushing your health & fitness goals"
              : "Register to start your health & fitness journey with us."}
          </p>
        </div>
        <Switch
          checked={isLogin}
          onChange={toggleLogin}
          className={` cursor-pointer p-4 relative flex justify-between gap-4 items-center h-[72px] w-full max-w-[400px] min-w-[300px] rounded-full bg-lime-500/20 transition-colors duration-200 ease-out`}
        >
          <span className="sr-only">Toggle theme</span>
          <span className="w-full p-4 h-full bg-transparent z-10 flex items-center text-center justify-center font-medium text-lg tracking-wide">
            Login
          </span>
          <span className="w-full p-4 h-full bg-transparent z-10 flex items-center text-center justify-center font-medium text-lg tracking-wide">
            Sign up
          </span>
          <span
            className={`absolute z-0
             inline-block h-[56px] w-full min-w-[145px] max-w-[180px] transform rounded-full bg-lime-500 transition-transform duration-200 ease-out ${
               isLogin ? "translate-x-0" : "translate-x-[105%]"
             }`}
          ></span>
        </Switch>
        <form
          onSubmit={(e) => handleFormSubmit(e)}
          className="w-full flex flex-col gap-2 items-center mt-8"
        >
          {isLogin ? (
            <ul className="w-full p-0 flex flex-col gap-4">
              <LoginForm
                userName={userName}
                setUserName={setUserName}
                userEmail={userEmail}
                setUserEmail={setUserEmail}
                userPassword={userPassword}
                setUserPassword={setUserPassword}
                userConfirmPassword={userConfirmPassword}
                setUserConfirmPassword={setUserConfirmPassword}
                rememberMe={rememberMe}
                setRememberMe={setRememberMe}
              />
            </ul>
          ) : (
            <SignUpForm
              userName={userName}
              setUserName={setUserName}
              userEmail={userEmail}
              setUserEmail={setUserEmail}
              userPassword={userPassword}
              setUserPassword={setUserPassword}
              userConfirmPassword={userConfirmPassword}
              setUserConfirmPassword={setUserConfirmPassword}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
            />
          )}
          <button
            type="submit"
            className="w-full cursor-pointer max-w-[400px] min-w-[300px] h-[72px] rounded-[64px] mt-8 flex items-center justify-center text-center bg-black hover:bg-black/75 text-white font-semibold tracking-wide"
          >
            {isLogin ? "Login" : "Sign up"}
          </button>
        </form>
      </div>
    </PageContainer>
  );
};

export default page;
