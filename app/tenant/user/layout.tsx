
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentClient, getCurrentUser } from "@/lib/auth";
import ClientProvider from "@/lib/ClientProvider";
import ClientHeader from "@/components/ui/layout/ClientHeader";
import {prisma} from "@/lib/db"
import {cn} from "@/lib/utils"
import "@/app/globals.css";
import Header from "@/components/ui/layout/Header";
import AuthProvider from "@/lib/AuthLayoutWrapper"

type Props = {
  children: ReactNode;
};
import { Google_Sans} from "next/font/google";
import UserProvider from "@/lib/UserProvider";

const googleSans= Google_Sans({
  variable: "--font-google-sans",
  subsets: ["latin"],
});


export default async function UserDashboardLayout({ children }: Props) {
  const user = await getCurrentUser();

 if (!user) {
    redirect("/user/login");
  }

  return (
    <html className={cn(googleSans.variable, googleSans.className, googleSans)}>
      <body>
    <UserProvider initialUser={user}>
      <Header />
      <main className="min-h-screen w-full bg-gray-50 pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </UserProvider>
    </body>
    </html>
  );
}
