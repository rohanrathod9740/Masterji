import GlobalFloatingButton from "@/components/quick-add/GlobalFloatingButton";
import BottomNav from "@/components/ui/layout/BottomNav";
import "@/app/globals.css";
import Header from "@/components/ui/layout/Header"
import {ReactNode} from "react";
import { getCurrentUser } from "@/lib/auth";
import UserProvider from "@/lib/UserProvider";
import { prisma } from "@/lib/db";


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
    <html>
      <body>
    <UserProvider initialUser={userData}>
     <main className="min-h-screen w-full overflow-x-hidden flex flex-row justify-center">
       <Header />
       <div className="flex-1 flex flex-col m-8">
        <div className="flex-1 w-full py-10">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
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