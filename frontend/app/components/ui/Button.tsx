"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const VARIANT_STYLES: Record<Variant, string> = {
  primary:
    "bg-violet-600 text-white shadow-lg shadow-violet-600/20 hover:bg-violet-500 hover:shadow-violet-500/30",
  secondary:
    "border border-white/10 text-slate-300 hover:border-white/20 hover:text-white",
  ghost: "text-slate-400 hover:text-white hover:bg-white/[0.04]",
  danger:
    "bg-red-600/90 text-white hover:bg-red-500 shadow-lg shadow-red-600/15",
};

export default function Button({
  variant = "primary",
  loading = false,
  icon,
  children,
  disabled,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none ${VARIANT_STYLES[variant]} ${className}`}
      {...rest}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        icon
      )}
      {children}
    </button>
  );
}