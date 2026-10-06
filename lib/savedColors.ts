const STORAGE_KEY = "ff-saved-colors";
const MAX_SAVED = 24;

function normalizeHex(input: string): string | null {
  const raw = input.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return null;
  return `#${raw.toUpperCase()}`;
}

export function listSavedColors(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: string[] = [];
    for (const item of parsed) {
      if (typeof item !== "string") continue;
      const hex = normalizeHex(item);
      if (hex && !out.some((c) => c.toLowerCase() === hex.toLowerCase())) {
        out.push(hex);
      }
      if (out.length >= MAX_SAVED) break;
    }
    return out;
  } catch {
    return [];
  }
}

function persist(colors: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(colors.slice(0, MAX_SAVED)));
}

export function addSavedColor(input: string): string[] {
  const hex = normalizeHex(input);
  if (!hex) return listSavedColors();
  const current = listSavedColors().filter(
    (c) => c.toLowerCase() !== hex.toLowerCase(),
  );
  const next = [hex, ...current].slice(0, MAX_SAVED);
  persist(next);
  return next;
}

export function removeSavedColor(input: string): string[] {
  const hex = normalizeHex(input);
  if (!hex) return listSavedColors();
  const next = listSavedColors().filter(
    (c) => c.toLowerCase() !== hex.toLowerCase(),
  );
  persist(next);
  return next;
}
