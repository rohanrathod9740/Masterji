import { ProtectedShell } from "@/components/layout/protected-shell";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
