"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export interface UserProfile {
  id: string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  role: "ATHLETE" | "RECRUITER" | "ADMIN" | "SUPER_ADMIN";
  avatar?: string;
  image?: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email?: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  const fetchUser = React.useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          return;
        }
      }
      setUser(null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { authenticated: false }))
      .then((data) => {
        if (isMounted) {
          if (data.authenticated && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email?: string, password?: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return { success: false, error: data.error, redirectingToCheckout: true };
        }
        return { success: false, error: data.error || "Sign in failed" };
      }

      setUser(data.user);
      router.push("/dashboard");
      return { success: true };
    } catch {
      return { success: false, error: "Network error during sign in" };
    }
  };

  const signup = async (formData: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Sign up failed" };
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return { success: true, redirectingToCheckout: true };
      }

      setUser(data.user);
      router.push("/dashboard");
      return { success: true };
    } catch {
      return { success: false, error: "Network error during sign up" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout
    }
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        refetchUser: fetchUser,
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
      login: async () => ({ success: false, error: "Auth provider missing" }),
      signup: async () => ({ success: false, error: "Auth provider missing" }),
      logout: async () => {},
      refetchUser: async () => {},
    };
  }
  return context;
}
