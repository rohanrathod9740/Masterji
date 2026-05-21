import { ReactNode } from "react"
import Header from "@/components/ui/layout/Header";
import GlobalFloatingButton from "@/components/quick-add/GlobalFloatingButton";
import BottomNav from "@/components/ui/layout/BottomNav";

type Props = {
    children:ReactNode;
}

 export default function Layout({ children }: Props) {
   return (
     <main className="min-h-screen text-black flex flex-col items-center justify-center">
       <Header />
       <div className="flex-1 flex flex-col">
         <div className="flex-1 container py-10 items-center justify-center w-full max-w-5xl">
           {children}
         </div>
         {/* Add bottom padding on mobile to account for bottom nav */}
         <div className="h-20 sm:h-0" />
         <GlobalFloatingButton/>
       </div>
       <BottomNav />
     </main>
   );
 }