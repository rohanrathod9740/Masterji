import { ReactNode } from "react"
import Header from "@/components/ui/layout/Header";
import GlobalFloatingButton from "@/components/quick-add/GlobalFloatingButton";
import BottomNav from "@/components/ui/layout/BottomNav";

type Props = {
    children:ReactNode;
}

 export default function Layout({ children }: Props) {
   return (
     <main className="min-h-screen w-full overflow-x-hidden flex flex-col justify-center">
       <Header />
       <div className="flex-1 flex flex-col">
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
   );
 }