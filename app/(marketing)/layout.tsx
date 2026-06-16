import type { Metadata } from "next";
import { Inter,Google_Sans } from "next/font/google";
import AuthLayoutWrapper from "@/lib/AuthLayoutWrapper";
import "@/app/globals.css";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";

const inter= Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const googleSans = Google_Sans({
  variable: "--font-google-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Ayushman",
  description: "AI based CRM",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const isAuthenticated = !!user
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", googleSans.variable)}
    >
      <body className="min-h-screen w-full overflow-x-hidden flex flex-col">
        <AuthLayoutWrapper isAuthenticated={isAuthenticated}>
          {children}
        </AuthLayoutWrapper>
      </body>
    </html>
  );
}
