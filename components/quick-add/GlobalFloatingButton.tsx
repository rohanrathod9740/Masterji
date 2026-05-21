"use client";
import { useState, useRef, useCallback } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  BookmarkIcon,
  ChatBubbleIcon,
  PlusIcon,
} from "@radix-ui/react-icons";


type MenuItem = {
  icon: React.ReactNode;
  label: string;
  color: string;
  trackColor: string;
  onClick?: () => void;
};
































const HOLD_DURATION = 400; // ms

const GlobalFloatingButton = () => {
const MENU_ITEMS: MenuItem[] = [
  {
    icon: <MagnifyingGlassIcon width={20} height={20} />,
    label: "Search",
    color: "bg-sky-500 hover:bg-sky-400",
    trackColor: "#0ea5e9",
    onClick: () => console.log("Search"),
  },
  {
    icon: <BookmarkIcon width={20} height={20} />,
    label: "Commitment",
    color: "bg-violet-500 hover:bg-violet-400",
    trackColor: "#8b5cf6",
    onClick: () => console.log("Commitment"),
  },
  {
    icon: <ChatBubbleIcon width={20} height={20} />,
    label: "Interaction",
    color: "bg-emerald-500 hover:bg-emerald-400",
    trackColor: "#10b981",
    onClick: () => console.log("Interaction"),
  },
  {
    icon: <ChatBubbleIcon width={20} height={20} />,
    label: "Person",
    color: "bg-yellow-500 hover:bg-red-400",
    trackColor: "#103981",
    onClick: () => router.push("/people"), 
  }
];

  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pressing, setPressing] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [progress, setProgress] = useState(0); // 0–100

  const startHold = useCallback(() => {
    if (open) return;
    setPressing(true);
    setProgress(0);

    const start = Date.now();
    progressTimer.current = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min((elapsed / HOLD_DURATION) * 100, 100));
    }, 16);

    holdTimer.current = setTimeout(() => {
      clearInterval(progressTimer.current!);
      setProgress(100);
      setOpen(true);
      setPressing(false);
    }, HOLD_DURATION);
  }, [open]);

  const cancelHold = useCallback(() => {
    clearTimeout(holdTimer.current!);
    clearInterval(progressTimer.current!);
    setPressing(false);
    setProgress(0);
  }, []);

  const handleQuickTap = useCallback(() => {
    if (open) setOpen(false);
  }, [open]);

  // SVG progress ring
  const RING_R = 28;
  const circumference = 2 * Math.PI * RING_R;
  const strokeDash = (progress / 100) * circumference;

  // Distribute items evenly along the track, excluding the FAB position (bottom)
  // Track runs full viewport height; FAB anchors at bottom-right.
  // Items are placed from bottom upward, spaced equally.
  const ITEM_COUNT = MENU_ITEMS.length;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex flex-col items-end pointer-events-none">
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 pointer-events-auto"
          onPointerDown={() => setOpen(false)}
        />
      )}

      {/* Vertical track + items column */}
      <div className="relative z-50 flex flex-col items-center justify-end h-full pointer-events-none"
        style={{ width: 80 }}
      >

        {/* Animated track line */}
        <div
          className="absolute right-[39px] top-0 bottom-[72px] w-[2px] origin-bottom"
          style={{
            background: "linear-gradient(to bottom, transparent, rgba(99,102,241,0.15) 20%, rgba(99,102,241,0.4) 80%, rgba(99,102,241,0.6))",
            transform: open ? "scaleY(1)" : "scaleY(0)",
            transition: "transform 500ms cubic-bezier(0.34,1.2,0.64,1)",
          }}
        />

        {/* Glowing dot that travels up the track on open */}
        <div
          className="absolute right-[35px] w-[10px] h-[10px] rounded-full bg-indigo-400 shadow-[0_0_8px_3px_rgba(99,102,241,0.6)]"
          style={{
            bottom: open ? "calc(100% - 20px)" : "72px",
            transition: open
              ? "bottom 500ms cubic-bezier(0.34,1.1,0.64,1)"
              : "bottom 300ms ease-in",
            opacity: open ? 1 : 0,
          }}
        />

        {/* Menu items distributed vertically */}
        {MENU_ITEMS.map((item, i) => {
          // Space items from top → bottom within the track (excluding FAB area at bottom)
          // Use percentage-based top positioning
          const topPct = 5 + (i / (ITEM_COUNT)) * 72; // spread from ~5% to ~77% down

          return (
            <div
              key={item.label}
              className="absolute flex items-center gap-3 pointer-events-auto"
              style={{
                top: `${topPct}%`,
                right: open ? 16 : -80,
                opacity: open ? 1 : 0,
                transition: `right 400ms cubic-bezier(0.34,1.56,0.64,1) ${i * 60}ms, opacity 250ms ease ${i * 60}ms`,
              }}
            >
              {/* Label */}
              <span
                className="
                  whitespace-nowrap rounded-md
                  bg-gray-950/90 px-2.5 py-1
                  text-[11px] font-semibold tracking-widest uppercase text-white/80
                  shadow-lg backdrop-blur-sm border border-white/10
                "
              >
                {item.label}
              </span>

              {/* Circle button with colored left border accent */}
              <button
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
                className={`
                  ${item.color}
                  flex h-12 w-12 shrink-0 items-center justify-center
                  rounded-full text-white shadow-xl
                  transition-transform duration-150 active:scale-90
                  ring-2 ring-white/20
                `}
                style={{
                  boxShadow: `0 0 16px 2px ${item.trackColor}55`,
                }}
              >
                {item.icon}
              </button>
            </div>
          );
        })}

        {/* Main FAB — anchored to bottom */}
        <div className="pointer-events-auto mb-6">
          <button
            className="
              relative flex h-[72px] w-[72px] items-center justify-center
              rounded-full bg-indigo-600 text-white shadow-2xl
              select-none outline-none
              hover:bg-indigo-500
            "
            style={{
              transform: pressing ? "scale(0.93)" : open ? "scale(1.08)" : "scale(1)",
              transition: "transform 150ms ease, background-color 150ms ease",
            }}
            onPointerDown={startHold}
            onPointerUp={() => {
              cancelHold();
              handleQuickTap();
            }}
            onPointerLeave={cancelHold}
            onContextMenu={(e) => e.preventDefault()}
            aria-label="Quick-Add menu"
          >
            {/* Progress ring */}
            {pressing && (
              <svg
                className="absolute inset-0 -rotate-90"
                width="72"
                height="72"
                viewBox="0 0 72 72"
              >
                <circle
                  cx="36"
                  cy="36"
                  r={RING_R}
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="3"
                />
                <circle
                  cx="36"
                  cy="36"
                  r={RING_R}
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeDasharray={`${strokeDash} ${circumference}`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 16ms linear" }}
                />
              </svg>
            )}

            {/* Plus → X icon */}
            <span
              className="transition-transform duration-300 ease-in-out"
              style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
            >
              <PlusIcon width={28} height={28} />
            </span>

            {/* Pulse ring when idle */}
            {!open && !pressing && (
              <span className="absolute inset-0 animate-ping rounded-full bg-indigo-400 opacity-20" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalFloatingButton;