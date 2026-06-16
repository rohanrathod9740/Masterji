"use client";
import React, { createContext, useContext, useState } from "react";
import { Client } from "@/prisma/migrations/client";

// We omit passwordHash so it never reaches the client bundle
export type SafeClient = Omit<Client, "passwordHash">;

type ClientContextType = {
  client: SafeClient | null;
  setClient: (c: SafeClient | null) => void;
};

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({
  children,
  initialClient,
}: {
  children: React.ReactNode;
  initialClient: SafeClient | null;
}) {
  const [client, setClient] = useState<SafeClient | null>(initialClient);

  return (
    <ClientContext.Provider value={{ client, setClient }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error("useClient must be used within a ClientProvider");
  return ctx;
}

export default ClientProvider;
