"use client";

import MainHeader from "@/components/ui/MainHeader";
import PageContainer from "@/components/ui/PageContainer";
import React, { FormEvent, useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyholeIcon,
  LockKeyholeOpen,
  Mail,
  User2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Alert from "@/components/ui/Alert";
import { useTheme } from "next-themes";

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

/** ---------- Shared small helpers ---------- */
const FieldIconLabel: React.FC<{
  htmlFor: string;
  children: React.ReactNode;
}> = ({ htmlFor, children }) => (
  <label
    htmlFor={htmlFor}
    className="flex items-center gap-2 absolute left-2 top-0 bottom-0 my-0 text-neutral-400"
  >
    <span className="[&>*]:size-4 sm:[&>*]:size-5">{children}</span>
  </label>
);

const inputBase =
  "w-full h-12 border border-neutral-200 dark:border-neutral-700 p-2 rounded-sm pl-9 bg-transparent text-sm sm:text-base";

/** ---------- Forms ---------- */
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <ul className="w-full p-0 flex flex-col gap-3 sm:gap-4">
      <li className="w-full relative">
        <input
          required
          type="text"
          id="name"
          name="name"
          className={inputBase}
          placeholder="Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <FieldIconLabel htmlFor="name">
          <User2 />
        </FieldIconLabel>
      </li>
      <li className="w-full relative">
        <input
          required
          type="email"
          id="email"
          name="email"
          className={inputBase}
          placeholder="Email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
        />
        <FieldIconLabel htmlFor="email">
          <Mail />
        </FieldIconLabel>
      </li>
      <li className="w-full relative">
        <input
          required
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          className={inputBase}
          placeholder="Password"
          value={userPassword}
          onChange={(e) => setUserPassword(e.target.value)}
        />
        <FieldIconLabel htmlFor="password">
          <LockKeyholeOpen />
        </FieldIconLabel>
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          title={showPassword ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-2 my-0 flex items-center justify-center px-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </li>
      <li className="w-full relative">
        <input
          required
          type={showConfirm ? "text" : "password"}
          id="confirmPassword"
          name="confirmPassword"
          className={inputBase}
          placeholder="Confirm Password"
          value={userConfirmPassword}
          onChange={(e) => setUserConfirmPassword(e.target.value)}
        />
        <FieldIconLabel htmlFor="confirmPassword">
          <LockKeyholeIcon />
        </FieldIconLabel>
        <button
          type="button"
          onClick={() => setShowConfirm((v) => !v)}
          aria-label={showConfirm ? "Hide password" : "Show password"}
          aria-pressed={showConfirm}
          title={showConfirm ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-2 my-0 flex items-center justify-center px-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          {showConfirm ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </li>
      <li className="w-full relative flex items-center">
        <input
          id="rememberSignUp"
          type="checkbox"
          className="h-4 w-4"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        <label htmlFor="rememberSignUp" className="ml-2 text-xs sm:text-sm">
          Remember Me
        </label>
      </li>
    </ul>
  );
};

const LoginForm: React.FC<SignUpProps> = ({
  userEmail,
  userPassword,
  rememberMe,
  setUserEmail,
  setUserPassword,
  setRememberMe,
}) => {
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  return (
    <ul className="w-full p-0 flex flex-col gap-3 sm:gap-4">
      <li className="w-full relative">
        <input
          required
          type="email"
          id="loginEmail"
          name="email"
          className={inputBase}
          placeholder="Email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
        />
        <FieldIconLabel htmlFor="loginEmail">
          <Mail />
        </FieldIconLabel>
      </li>
      <li className="w-full relative">
        <input
          required
          type={showLoginPassword ? "text" : "password"}
          id="loginPassword"
          name="password"
          className={inputBase}
          placeholder="Password"
          value={userPassword}
          onChange={(e) => setUserPassword(e.target.value)}
        />
        <FieldIconLabel htmlFor="loginPassword">
          <LockKeyholeOpen />
        </FieldIconLabel>
        <button
          type="button"
          onClick={() => setShowLoginPassword((v) => !v)}
          aria-label={showLoginPassword ? "Hide password" : "Show password"}
          aria-pressed={showLoginPassword}
          title={showLoginPassword ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-2 my-0 flex items-center justify-center px-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          {showLoginPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </li>
      <li className="w-full relative flex items-center">
        <input
          id="rememberLogin"
          type="checkbox"
          className="h-4 w-4"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        <label htmlFor="rememberLogin" className="ml-2 text-xs sm:text-sm">
          Remember Me
        </label>
      </li>
    </ul>
  );
};

/** ---------- Segmented Toggle (replaces Switch) ---------- */
const SegmentedAuthToggle: React.FC<{
  isLogin: boolean;
  setIsLogin: (v: boolean) => void;
}> = ({ isLogin, setIsLogin }) => {
  const { theme, setTheme } = useTheme();
  const [isLight, setIsLight] = useState(theme === "light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsLight(theme === "light");
    setMounted(true);
  }, [theme]);

  if (!mounted) return <></>;

  return (
    <div className="relative w-full max-w-[460px]">
      <div
        role="tablist"
        aria-label="Auth mode"
        className="relative grid grid-cols-2 items-center rounded-full bg-lime-500/20 p-1 h-[80px] cursor-pointer"
      >
        {/* Active pill */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-y-1 w-1/2 rounded-full bg-lime-500  transition-all duration-200 ease-out ${
            isLogin ? "left-1" : "left-1/2"
          }`}
        />
        {/* Buttons */}
        <button
          role="tab"
          aria-selected={isLogin}
          className={`relative z-10 h-12 sm:h-14 rounded-full text-base sm:text-lg md:text-xl font-medium tracking-wide transition-colors cursor-pointer ${
            isLight
              ? isLogin
                ? "text-white"
                : "text-black"
              : "text-white hover:text-lime-700"
          }`}
          onClick={() => setIsLogin(true)}
        >
          Login
        </button>
        <button
          role="tab"
          aria-selected={!isLogin}
          className={`relative z-10 h-12 sm:h-14 rounded-full text-base sm:text-lg md:text-xl font-medium tracking-wide transition-colors cursor-pointer ${
            isLight
              ? !isLogin
                ? "text-white"
                : "text-black"
              : "text-white hover:text-lime-700"
          }`}
          onClick={() => setIsLogin(false)}
        >
          Sign up
        </button>
      </div>
    </div>
  );
};

/** ---------- Page ---------- */
const page = (props: Props) => {
  const [isLogin, setIsLogin] = useState(true);
  const route = useRouter();
  const { register, login } = useAuth();

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userConfirmPassword, setUserConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      setSubmitting(true);

      if (isLogin) {
        if (!userEmail) throw new Error("Missing Email field");
        if (!userPassword) throw new Error("Missing Password field");
        if (userPassword.length < 6)
          throw new Error("Password length is too short");

        await login(userEmail, userPassword);
        route.replace("/dash/workouts"); // replace, not push
      } else {
        if (!userName) throw new Error("Missing Name field");
        if (!userEmail) throw new Error("Missing Email field");
        if (!userPassword) throw new Error("Missing Password field");
        if (userPassword.length < 6)
          throw new Error("Password length is too short");
        if (userPassword !== userConfirmPassword)
          throw new Error("Passwords do not match");

        await register(userName, userEmail, userPassword);
        route.replace("/dash/workouts"); // replace, not push
      }
    } catch (error: any) {
      // show server-provided message if available
      setErrorMsg(error?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <Alert
        open={!!errorMsg}
        onClose={() => setErrorMsg(null)}
        title="Oops!"
        message={errorMsg ?? ""}
        variant="error"
        autoCloseMs={4000}
      />
      <MainHeader hasDetails={false} />
      <div className="w-full px-4 pt-6 sm:pt-8 flex flex-col gap-4 items-center max-w-[520px] mx-auto">
        <div className="flex flex-col w-full text-center gap-2">
          <h1 className="text-3xl sm:text-5xl text-center">
            {isLogin ? "Welcome Back!" : "Welcome to FitForge!"}
          </h1>
          <p className="py-3 sm:py-4 text-base sm:text-lg text-pretty">
            {isLogin
              ? "Let's keep crushing your health & fitness goals"
              : "Register to start your health & fitness journey with us."}
          </p>
        </div>

        <SegmentedAuthToggle isLogin={isLogin} setIsLogin={setIsLogin} />

        <form
          onSubmit={handleFormSubmit}
          className="w-full flex flex-col gap-3 sm:gap-4 items-center mt-6 sm:mt-8"
        >
          {isLogin ? (
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
            disabled={submitting}
            type="submit"
            className="w-full h-14 sm:h-20 rounded-full mt-6 sm:mt-8 text-base md:text-lg cursor-pointer flex items-center justify-center text-center bg-black hover:bg-black/80 text-white font-semibold tracking-wide"
          >
            {isLogin
              ? submitting
                ? "Logging In..."
                : "Login"
              : submitting
              ? "Creating Account..."
              : "Sign up"}
          </button>
        </form>
      </div>
    </PageContainer>
  );
};

export default page;
``;
