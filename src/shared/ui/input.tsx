"use client";

import * as React from "react";

import { cn } from "@/shared/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, ...props }, ref) => (
    <label className="flex flex-col gap-1 text-sm text-slate-700">
      {label && <span className="font-medium text-slate-800">{label}</span>}
      <input
        ref={ref}
        type={type}
        className={cn(
          "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-200 focus:outline-none",
          error ? "border-red-400" : "",
          className,
        )}
        {...props}
      />
      {(error || helperText) && (
        <span
          className={cn("text-xs", error ? "text-red-500" : "text-slate-500")}
        >
          {error ?? helperText}
        </span>
      )}
    </label>
  ),
);
Input.displayName = "Input";
