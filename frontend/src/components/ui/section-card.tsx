import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function SectionCard({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[32px] border border-stone-200/90 bg-white/92 p-6 shadow-[0_30px_70px_-42px_rgba(32,29,24,0.24)] backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}
