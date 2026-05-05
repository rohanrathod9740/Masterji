import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-[#163c39] bg-[#163c39] text-[#f7f5ef] shadow-[0_18px_40px_-20px_rgba(22,60,57,0.55)] hover:bg-[#102d2a]",
  secondary:
    "border-stone-200 bg-[#fbfaf7] text-stone-900 hover:bg-white",
  ghost:
    "border-transparent bg-transparent text-stone-700 hover:bg-stone-100/85 hover:text-stone-950",
  danger:
    "border-[#b54040] bg-[#b54040] text-white hover:bg-[#973434]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-2xl border font-medium transition focus:outline-none focus:ring-2 focus:ring-teal-500/35 disabled:cursor-not-allowed disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  fullWidth = false,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonClasses({ variant, size, fullWidth }), className)}
      type={type}
      {...props}
    />
  );
}
