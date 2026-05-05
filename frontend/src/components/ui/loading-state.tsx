import { cn } from "@/lib/utils";

type LoadingStateProps = {
  label?: string;
  fullscreen?: boolean;
};

export function LoadingState({
  label = "Loading...",
  fullscreen = false,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullscreen ? "min-h-screen" : "min-h-[280px]",
      )}
    >
      <div className="flex items-center gap-3 rounded-full border border-stone-200 bg-white/95 px-5 py-3 text-sm font-medium text-stone-700 shadow-[0_20px_45px_-30px_rgba(28,25,23,0.35)]">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#163c39]" />
        <span>{label}</span>
      </div>
    </div>
  );
}
