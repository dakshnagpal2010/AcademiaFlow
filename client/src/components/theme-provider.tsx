import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "forest";

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
    root.classList.remove("dark", "forest");
    
    // Apply the current theme
    root.classList.add(theme);
    
    // For forest theme, apply specific forest green styles
    if (theme === "forest") {
      // Set CSS variables for forest theme - forest greens and earth tones
      root.style.setProperty('--background', '15 35 25'); // dark forest green
      root.style.setProperty('--foreground', '220 255 235'); // light mint
      root.style.setProperty('--card', '20 45 30'); // darker forest
      root.style.setProperty('--card-foreground', '210 245 225'); // pale green
      root.style.setProperty('--border', '40 80 60'); // forest border
      root.style.setProperty('--muted', '25 50 35'); // muted forest
      root.style.setProperty('--muted-foreground', '150 180 160'); // muted text
      root.style.setProperty('--primary', '76 175 80'); // forest green primary
      root.style.setProperty('--primary-foreground', '255 255 255'); // white text
    } else {
      // Reset to default dark theme
      root.style.removeProperty('--background');
      root.style.removeProperty('--foreground');
      root.style.removeProperty('--card');
      root.style.removeProperty('--card-foreground');
      root.style.removeProperty('--border');
      root.style.removeProperty('--muted');
      root.style.removeProperty('--muted-foreground');
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-foreground');
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
