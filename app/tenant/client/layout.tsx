import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentClient } from "@/lib/auth";
import ClientProvider from "@/lib/ClientProvider";
import ClientHeader from "@/components/ui/layout/ClientHeader";
import { Google_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import "@/app/globals.css";

type Props = {
  children: ReactNode;
};

const googleSans = Google_Sans({
  variable: "--font-google-sans",
  subsets: ["latin"],
});

export default async function ClientDashboardLayout({ children }: Props) {
  const client = await getCurrentClient();

  // Not authenticated — bounce to client login
  if (!client) {
    redirect("/client/login");
  }

  return (
    <html lang="en" className={cn("h-full antialiased", googleSans.variable)}>
      <body>
        <ClientProvider initialClient={client}>
          <ClientHeader />
          <main className="min-h-screen w-full bg-gray-50 pt-20">
            <div className="px-2 py-9">
              {children}
            </div>
          </main>
        </ClientProvider>
      </body>
    </html>
  );
}
