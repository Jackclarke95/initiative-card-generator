export type Theme = "light" | "dark";

const COOKIE_NAME = "initiative-cards:theme";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function isTheme(value: string | null | undefined): value is Theme {
  return value === "light" || value === "dark";
}

export function getStoredTheme(): Theme | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`),
  );
  const value = match ? decodeURIComponent(match[1]) : null;
  return isTheme(value) ? value : null;
}

export function getPreferredTheme(): Theme {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "dark";
}

/** Source of truth for a component's initial render: the DOM attribute
 *  the inline bootstrap script (see THEME_BOOTSTRAP_SCRIPT) already set
 *  before hydration, so this never disagrees with what's on screen. */
export function getCurrentTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  const attr = document.documentElement.getAttribute("data-theme");
  return isTheme(attr) ? attr : "dark";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  document.cookie = `${COOKIE_NAME}=${theme}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
}

// Runs synchronously in <head>, before first paint: reads the saved
// cookie, falls back to the OS/browser color-scheme preference, and
// stamps data-theme onto <html> so there's no dark/light flash.
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )${COOKIE_NAME}=([^;]*)/);var t=m?decodeURIComponent(m[1]):null;if(t!=="light"&&t!=="dark"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})();`;
