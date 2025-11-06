import { Search } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useEffect, useState, useCallback } from "react";

type Props = {
  placeholder?: string;
  onSearch?: (query: string) => void;
  debounceMs?: number;
  className?: string;
};

const MainSearchInput = ({
  placeholder = "Search...",
  onSearch,
  debounceMs = 300,
  className = "",
}: Props) => {
  const { theme } = useTheme();
  const [isLight, setIsLight] = useState(theme === "light");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsLight(theme === "light");
  }, [theme]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onSearch) {
        onSearch(searchQuery);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, onSearch, debounceMs]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  return (
    <div className={`w-full relative p-4 ${className}`}>
      <input
        type="search"
        value={searchQuery}
        onChange={handleInputChange}
        className={`w-full px-8 py-2 rounded-2xl border border-neutral-200 ${
          isLight ? "bg-white" : "bg-black"
        } h-12`}
        placeholder={placeholder}
      />
      <Search className="size-4 absolute left-7 top-0 bottom-0 my-auto" />
    </div>
  );
};

export default MainSearchInput;
