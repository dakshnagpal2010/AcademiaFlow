import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "academiaflow-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove any existing theme classes
    root.classList.remove("light", "dark");
    
    // Apply the current theme
    root.classList.add(theme);
    
    // For light theme, apply specific light mode styles
    if (theme === "light") {
      // Set CSS variables for light theme - simple white background, black text
      root.style.setProperty('--background', '255 255 255');
      root.style.setProperty('--foreground', '0 0 0');
      root.style.setProperty('--card', '255 255 255');
      root.style.setProperty('--card-foreground', '0 0 0');
      root.style.setProperty('--border', '229 231 235'); // light gray
      root.style.setProperty('--muted', '249 250 251');
      root.style.setProperty('--muted-foreground', '107 114 128');
    } else {
      // Reset to default dark theme
      root.style.removeProperty('--background');
      root.style.removeProperty('--foreground');
      root.style.removeProperty('--card');
      root.style.removeProperty('--card-foreground');
      root.style.removeProperty('--border');
      root.style.removeProperty('--muted');
      root.style.removeProperty('--muted-foreground');
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
