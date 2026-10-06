export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "ff-theme";
export const THEME_EVENT = "ff-theme-change";

export const VIEWPORT_THEME = {
  light: {
    clear: "#e8ecf1",
    ground: "#dfe5ec",
    gridMajor: "#9aa6b5",
    gridMinor: "#c5ced8",
  },
  dark: {
    clear: "#0e1218",
    ground: "#161b22",
    gridMajor: "#3a4554",
    gridMinor: "#252c36",
  },
} as const;

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export function getTheme(): Theme {
  if (typeof document !== "undefined") {
    const attr = document.documentElement.dataset.theme;
    if (isTheme(attr)) return attr;
  }
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (isTheme(stored)) return stored;
    } catch {
      /* ignore */
    }
  }
  return "light";
}

export function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }));
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

export function subscribeTheme(onChange: (theme: Theme) => void): () => void {
  const handler = () => onChange(getTheme());
  window.addEventListener(THEME_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(THEME_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
