"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Farmer, Buyer } from "@/types";
import { authApi, farmersApi, buyersApi } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  farmerProfile: Farmer | null;
  buyerProfile: Buyer | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [farmerProfile, setFarmerProfile] = useState<Farmer | null>(null);
  const [buyerProfile, setBuyerProfile] = useState<Buyer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (role: string) => {
    try {
      if (role === "farmer") {
        const profile = await farmersApi.me();
        setFarmerProfile(profile);
      } else if (role === "buyer") {
        const profile = await buyersApi.me();
        setBuyerProfile(profile);
      }
    } catch {
      // Profile may not exist yet
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("agriconnect_token");
    const savedUser = localStorage.getItem("agriconnect_user");
    if (token && savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      fetchProfile(u.role).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    localStorage.setItem("agriconnect_token", data.access_token);
    localStorage.setItem("agriconnect_user", JSON.stringify(data.user));
    setUser(data.user);
    await fetchProfile(data.user.role);
  };

  const logout = () => {
    localStorage.removeItem("agriconnect_token");
    localStorage.removeItem("agriconnect_user");
    setUser(null);
    setFarmerProfile(null);
    setBuyerProfile(null);
    window.location.href = "/login";
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.role);
  };

  return (
    <AuthContext.Provider
      value={{ user, farmerProfile, buyerProfile, isLoading, login, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
