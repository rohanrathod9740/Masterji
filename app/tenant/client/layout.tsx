import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentClient } from "@/lib/auth";
import ClientProvider from "@/lib/ClientProvider";
import ClientHeader from "@/components/ui/layout/ClientHeader";
import {prisma} from "@/lib/db"
import {cn} from "@/lib/utils"
import AuthLayoutWrapper from "@/lib/AuthLayoutWrapper";
import "@/app/globals.css";

type Props = {
  children: ReactNode;
};
import { Google_Sans} from "next/font/google";

const googleSans= Google_Sans({
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
    <html className={cn(googleSans.variable, googleSans.className, googleSans)}>
      <body>
    <AuthLayoutWrapper isAuthenticated={!!client}>
    <ClientProvider initialClient={client}>
      <ClientHeader />
      <main className="min-h-screen w-full bg-gray-50 pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </ClientProvider>
    </AuthLayoutWrapper>
    </body>
    </html>
  );
}
