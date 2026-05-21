 "use client";

 import Link from "next/link";
 import { usePathname } from "next/navigation";

 const BottomNav = () => {
   const pathname = usePathname();

   const isActive = (route: string) => {
     if (route === "/" && pathname === "/") return true;
     if (route !== "/" && pathname?.startsWith(route)) return true;
     return false;
   };

   const navItems = [
     { label: "Dashboard", route: "/", icon: "📊" },
     { label: "People", route: "/people", icon: "👥" },
     { label: "Cases", route: "/cases", icon: "📋" },
     { label: "Commitments", route: "/commitments", icon: "✓" },
   ];

   return (
     <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 sm:hidden">
       <div className="flex justify-between items-center h-20">
         {navItems.map((item) => (
           <Link
             key={item.route}
             href={item.route}
             className={`flex flex-col items-center justify-center flex-1 h-full gap-1 text-xs font-medium transition-  colors ${
               isActive(item.route)
                 ? "text-black border-t-2 border-black"
                 : "text-gray-500 hover:text-gray-700"
             }`}
           >
             <span className="text-xl">{item.icon}</span>
             <span className="text-xs">{item.label}</span>
           </Link>
         ))}
       </div>
     </nav>
   );
 };

 export default BottomNav;