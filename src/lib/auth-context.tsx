"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "ATHLETE" | "RECRUITER" | "ADMIN";
  avatar: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email?: string, password?: string) => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("rep1_auth_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // Local storage unavailable or parsing failed
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (email?: string) => {
    const defaultUser: UserProfile = {
      id: "usr_marvin",
      name: "Marvin Constant",
      email: email || "marvin@rep1recruiting.com",
      role: "ATHLETE",
      avatar: "MC",
    };
    setUser(defaultUser);
    try {
      localStorage.setItem("rep1_auth_user", JSON.stringify(defaultUser));
    } catch {
      // ignore
    }
    router.push("/dashboard");
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("rep1_auth_user");
    } catch {
      // ignore
    }
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: () => {},
      logout: () => {},
    };
  }
  return context;
}
