"use client"
import React, { createContext, useContext, useState } from "react";

type User = {
  id: string;
  name?: string | null;
  dob?: Date| null ;
  type?:string | "it";
  email?: string | null;
  phone?: string | null;
  nameOfConsultancy?:string | null;
  address?:string|null;
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
