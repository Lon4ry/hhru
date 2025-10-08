"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/shared/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";

type ButtonSize = "sm" | "md" | "lg" | "icon";

const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/80 disabled:pointer-events-none disabled:opacity-60";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-slate-900 text-white hover:bg-slate-800",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
  ghost: "hover:bg-slate-100 text-slate-900",
  outline: "border border-slate-300 hover:bg-slate-100 text-slate-900",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading = false, children, disabled, asChild = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref as never}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={(disabled || loading) as never}
        {...props}
      >
        {loading ? <span className="animate-pulse">Загрузка...</span> : children}
      </Comp>
    );
  },
);
Button.displayName = "Button";
