import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Switch } from "@headlessui/react";
import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isLight, setIsLight] = useState(theme === "light");

  useEffect(() => {
    setIsLight(theme === "light");
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Switch
      checked={isLight}
      onChange={toggleTheme}
      className={` cursor-pointer scale-75 relative inline-flex items-center h-8 w-14 rounded-full bg-black transition-colors duration-200 ease-out ${
        isLight ? "bg-lime-500" : "bg-neutral-600"
      }`}
    >
      <span className="sr-only">Toggle theme</span>
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 ease-out ${
          isLight ? "translate-x-7" : "translate-x-1"
        }`}
      ></span>
    </Switch>
  );
}
