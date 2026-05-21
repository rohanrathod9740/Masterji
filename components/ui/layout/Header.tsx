import Link from "next/link";
// import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        

        {/* Logo */}
        <Link
          href="/"
          className="relative text-xl font-semibold tracking-tight text-black"
        >
          <span className="bg-gradient-to-r from-black to-gray-500 bg-clip-text text-transparent">
            Ayushman
          </span>
          <span className="text-black">.</span>
        </Link>

        {/* Spacer */}
        <div></div>
      </div>
    </header>
  );
};

export default Header;