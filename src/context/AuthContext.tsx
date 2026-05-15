"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Models } from "appwrite";
import { getCurrentUser, login, logout, register } from "@appwrite/auth";
import { getProfile } from "@appwrite/database";
import { client } from "@appwrite/appwrite";
import type { Profile } from "@appwrite/types";

type User = Models.User<Models.Preferences>;

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    const u = await getCurrentUser();
    setUser(u);
    if (u) {
      const p = await getProfile(u.$id);
      setProfile(p);
    } else {
      setProfile(null);
    }
  }

  useEffect(() => {
    loadUser().finally(() => setLoading(false));
  }, []);

  // Realtime: profile (balance, role) อัปเดตทันทีเมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    if (!user) return;
    const channel = `databases.zenvyshop.collections.profiles.documents.${user.$id}`;
    const unsub = client.subscribe(channel, (event) => {
      const updated = event.payload as Profile;
      setProfile(updated);
    });
    return () => unsub();
  }, [user]);

  async function handleLogin(email: string, password: string): Promise<User> {
    await login(email, password);
    const u = await getCurrentUser();
    setUser(u);
    if (u) setProfile(await getProfile(u.$id));
    return u!;
  }

  async function handleRegister(name: string, email: string, password: string): Promise<User> {
    await register(name, email, password);
    const u = await getCurrentUser();
    setUser(u);
    if (u) setProfile(await getProfile(u.$id));
    return u!;
  }

  async function handleLogout(): Promise<void> {
    await logout();
    setUser(null);
    setProfile(null);
  }

  async function refreshProfile(): Promise<void> {
    if (!user) return;
    const [p, u] = await Promise.all([getProfile(user.$id), getCurrentUser()]);
    setProfile(p);
    if (u) setUser(u);
  }

  const isAdmin = profile?.role === "admin";

  return (
    <AuthContext.Provider value={{
      user, profile, isAdmin, loading,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
