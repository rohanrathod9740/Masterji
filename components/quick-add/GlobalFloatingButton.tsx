"use client";
import { useState, useRef, useCallback } from "react";
import { Button } from "../ui/button";
import {
  MagnifyingGlassIcon,
  BookmarkIcon,
  ChatBubbleIcon,
  PlusIcon,
} from "@radix-ui/react-icons";

type MenuItem = {
  icon: React.ReactNode;
  label: string;
  angle: number; // degrees, 0 = right, going counter-clockwise
  color: string;
  onClick?: () => void;
};

const MENU_ITEMS: MenuItem[] = [
  {
    icon: <MagnifyingGlassIcon width={20} height={20} />,
    label: "Search",
    angle: 150,
    color: "bg-sky-500 hover:bg-sky-400",
    onClick: () => console.log("Search"),
  },
  {
    icon: <BookmarkIcon width={20} height={20} />,
    label: "Commitment",
    angle: 210,
    color: "bg-violet-500 hover:bg-violet-400",
    onClick: () => console.log("Commitment"),
  },
  {
    icon: <ChatBubbleIcon width={20} height={20} />,
    label: "Interaction",
    angle: 270,
    color: "bg-emerald-500 hover:bg-emerald-400",
    onClick: () => console.log("Interaction"),
  },
];

const RADIUS = 88; // px from center of main button
const HOLD_DURATION = 400; // ms

function polarToCartesian(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.cos(rad) * radius,
    y: -Math.sin(rad) * radius, // negative because y increases downward
  };
}

const GlobalFloatingButton = () => {
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
    if (open) {
      setOpen(false);
    }
  }, [open]);

  // SVG arc for progress ring
  const RING_R = 36;
  const RING_C = 40; // cx/cy
  const circumference = 2 * Math.PI * RING_R;
  const strokeDash = (progress / 100) * circumference;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Backdrop to close on outside click */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onPointerDown={() => setOpen(false)}
        />
      )}

      <div className="relative z-50 flex items-center justify-center">
        {/* Radial menu items */}
        {MENU_ITEMS.map((item, i) => {
          const { x, y } = polarToCartesian(item.angle, RADIUS);
          return (
            <div
              key={item.label}
              className="absolute flex flex-col items-center gap-1"
              style={{
                transform: open
                  ? `translate(${x}px, ${y}px) scale(1)`
                  : `translate(0px, 0px) scale(0.4)`,
                opacity: open ? 1 : 0,
                transition: `transform 350ms cubic-bezier(0.34,1.56,0.64,1) ${i * 45}ms, opacity 250ms ease ${i * 45}ms`,
                pointerEvents: open ? "auto" : "none",
              }}
            >
              {/* Label */}
              <span
                className="
                  whitespace-nowrap rounded-md
                  bg-gray-900/90 px-2 py-0.5
                  text-[11px] font-medium tracking-wide text-white
                  shadow-lg backdrop-blur-sm
                "
                style={{
                  // Position label above or below based on angle
                  order: item.angle > 180 ? 1 : -1,
                }}
              >
                {item.label}
              </span>

              {/* Circle button */}
              <button
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
                className={`
                  ${item.color}
                  flex h-12 w-12 items-center justify-center
                  rounded-full text-white shadow-xl
                  transition-transform duration-150 active:scale-90
                  ring-2 ring-white/20
                `}
              >
                {item.icon}
              </button>
            </div>
          );
        })}

        {/* Main FAB */}
        <button
          className="
            relative flex h-[72px] w-[72px] items-center justify-center
            rounded-full bg-indigo-600 text-white shadow-2xl
            select-none outline-none
            transition-transform duration-150
            hover:bg-indigo-500
            active:scale-95
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
          {/* Progress ring SVG */}
          {pressing && (
            <svg
              className="absolute inset-0 -rotate-90"
              width="72"
              height="72"
              viewBox="0 0 80 80"
            >
              <circle
                cx="40"
                cy="40"
                r={RING_R}
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="3"
              />
              <circle
                cx={RING_C}
                cy={RING_C}
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

          {/* Icon: rotates to × when open */}
          <span
            className="transition-transform duration-300 ease-in-out"
            style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
          >
            <PlusIcon width={28} height={28} />
          </span>

          {/* Subtle pulse ring when closed */}
          {!open && !pressing && (
            <span className="absolute inset-0 animate-ping rounded-full bg-indigo-400 opacity-20" />
          )}
        </button>

        {/* Tooltip (only when closed & not pressing) */}
        {!open && !pressing && (
          <span
            className="
              pointer-events-none absolute right-[84px]
              whitespace-nowrap rounded-md
              bg-gray-900/90 px-3 py-1.5
              text-xs font-medium text-white
              opacity-0 shadow-lg backdrop-blur-sm
              transition-opacity duration-200
              group-hover:opacity-100
            "
          >
            Hold to open
          </span>
        )}
      </div>
    </div>
  );
};

export default GlobalFloatingButton;