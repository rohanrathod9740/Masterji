import type { Metadata } from "next";
import { Google_Sans, Space_Grotesk, Nunito_Sans } from "next/font/google";
import AuthLayoutWrapper from "@/lib/AuthLayoutWrapper";
import "@/app/globals.css";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";

const spaceGrotesk = Space_Grotesk({subsets:['latin'],variable:'--font-sans'});
const nunitoSans= Nunito_Sans({subsets:['latin'],variable:'--font-sans'})

const googleSans= Google_Sans({
  variable: "--font-google-sans",
  subsets: ["latin"],
});

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
      className={cn("h-full", "antialiased", nunitoSans, "font-sans", nunitoSans.variable)}
    >
      <body className="min-h-screen w-full overflow-x-hidden flex flex-col">
        {/* <AuthLayoutWrapper isAuthenticated={isAuthenticated}> */}
          {children}
        {/* </AuthLayoutWrapper> */}
      </body>
    </html>
  );
}
