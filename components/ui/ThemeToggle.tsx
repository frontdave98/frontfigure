"use client";

import { Asleep, Light } from "@carbon/icons-react";
import { useSyncExternalStore } from "react";
import {
  getTheme,
  subscribeTheme,
  toggleTheme,
  type Theme,
} from "@/lib/theme";

function subscribe(onStoreChange: () => void) {
  return subscribeTheme(() => onStoreChange());
}

function getServerSnapshot(): Theme {
  return "light";
}

type Props = {
  className?: string;
};

export function ThemeToggle({ className = "" }: Props) {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerSnapshot);

  return (
    <button
      type="button"
      className={`btn btn-ghost btn-sm gap-1.5 ${className}`}
      onClick={() => toggleTheme()}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <>
          <Light size={16} className="ff-icon" />
          <span className="hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <Asleep size={16} className="ff-icon" />
          <span className="hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  );
}
