import type { ReactNode } from "react";

import { SectionCard } from "@/components/ui/section-card";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <SectionCard className="border-dashed border-stone-300/90 bg-white/88 text-center">
      <div className="mx-auto max-w-md space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
          Nothing yet
        </p>
        <h3 className="text-2xl font-semibold text-stone-950">{title}</h3>
        <p className="text-sm leading-7 text-stone-600">{description}</p>
        {action ? <div className="pt-2">{action}</div> : null}
      </div>
    </SectionCard>
  );
}
