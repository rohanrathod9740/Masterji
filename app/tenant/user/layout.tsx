import GlobalFloatingButton from "@/components/quick-add/GlobalFloatingButton";
import BottomNav from "@/components/ui/layout/BottomNav";
import "@/app/globals.css";
import Header from "@/components/ui/layout/Header"
import {ReactNode} from "react";
import { getCurrentUser } from "@/lib/auth";
import UserProvider from "@/lib/UserProvider";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

import { Google_Sans} from "next/font/google";

const googleSans= Google_Sans({
  variable: "--font-google-sans",
  subsets: ["latin"],
});

type Props = {
    children:ReactNode;
}

 export default async function Layout({ children }: Props) {
  const user = await getCurrentUser();
  let userData = null;
  if (user) {
    userData = await prisma.user.findUnique({
      where: { id: user.id },
    });
  }

   return (
    <html className={cn(googleSans.variable, googleSans.className, googleSans)}>
      <body>
    <UserProvider initialUser={userData}>
     <main className="min-h-screen w-full overflow-x-hidden flex flex-row justify-center bg-gray-50">
       <Header />
       <div className="flex-1 flex flex-col">
        <div className="flex-1 w-full pt-20 pb-10">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
         </div>
         </div>
         {/* Add bottom padding on mobile to account for bottom nav */}
         <div className="h-20 sm:h-0" />
         <GlobalFloatingButton/>
       </div>
       <BottomNav />
     </main>
    </UserProvider>
     </body>
     </html>
   );
 }