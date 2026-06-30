"use client";
import React, { createContext, useContext, useState } from "react";

// Shape of the consultant user returned by getCurrentUser() — passwordHash stripped
type User = {
  id: string;
  email: string;
  phone: string;
  role: "CONSULTANT" | "CLIENT" | "ADMIN";
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type ContextType = {
  user: User | null;
  setUser: (u: User | null) => void;
};

const UserContext = createContext<ContextType | undefined>(undefined);

export function UserProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}

export default UserProvider;
