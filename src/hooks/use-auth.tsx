"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type UserRole = "CMLRE" | "Researcher" | "Student";

interface AuthContextType {
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedRole = localStorage.getItem("userRole") as UserRole | null;
      if (storedRole) {
        setRole(storedRole);
      }
    } catch (error) {
      console.error("Failed to read userRole from localStorage", error);
    }
  }, []);

  const handleSetRole = (newRole: UserRole | null) => {
    setRole(newRole);
    try {
       if (newRole) {
        localStorage.setItem("userRole", newRole);
      } else {
        localStorage.removeItem("userRole");
      }
    } catch (error) {
      console.error("Failed to save userRole to localStorage", error);
    }
  };
  
  if (!isMounted) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ role, setRole: handleSetRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
