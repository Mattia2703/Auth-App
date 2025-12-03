"use client";

import React, { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { loginAction, logoutAction, registerAction } from "@/lib/authActions";

interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialUser = (() => {
    const cookie = Cookies.get("user");
    if (!cookie) return null;
    try {
      return JSON.parse(cookie);
    } catch {
      return null;
    }
  })();

  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const syncUserFromCookie = () => {
    const cookie = Cookies.get("user");
    if (cookie) setUser(JSON.parse(cookie));
  };

  const login = async (username: string, password: string) => {
    setLoading(true);

    const result = await loginAction(username, password);

    if (!result.success) {
      setLoading(false);
      throw new Error(result.error);
    }

    syncUserFromCookie();

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    setLoading(true);

    const result = await registerAction(username, email, password);

    if (!result.success) {
      setLoading(false);
      throw new Error(result.error);
    }

    syncUserFromCookie();

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  };

  const logout = async () => {
    setUser(null);
    await logoutAction();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
