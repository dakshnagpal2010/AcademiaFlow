import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface StaffModeContextType {
  isStaffMode: boolean;
  setIsStaffMode: (value: boolean) => void;
}

const StaffModeContext = createContext<StaffModeContextType | undefined>(undefined);

export function StaffModeProvider({ children }: { children: ReactNode }) {
  const [isStaffMode, setIsStaffMode] = useState(() => {
    const saved = localStorage.getItem("staffMode");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("staffMode", isStaffMode.toString());
  }, [isStaffMode]);

  return (
    <StaffModeContext.Provider value={{ isStaffMode, setIsStaffMode }}>
      {children}
    </StaffModeContext.Provider>
  );
}

export function useStaffMode() {
  const context = useContext(StaffModeContext);
  if (context === undefined) {
    throw new Error("useStaffMode must be used within a StaffModeProvider");
  }
  return context;
}
