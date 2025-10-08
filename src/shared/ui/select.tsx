"use client";

import * as React from "react";

import { cn } from "@/shared/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, helperText, error, options, placeholder, ...props }, ref) => (
    <label className="flex flex-col gap-1 text-sm text-slate-700">
      {label && <span className="font-medium text-slate-800">{label}</span>}
      <select
        ref={ref}
        className={cn(
          "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200",
          error ? "border-red-400" : "",
          className,
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {(error || helperText) && (
        <span className={cn("text-xs", error ? "text-red-500" : "text-slate-500")}>{error ?? helperText}</span>
      )}
    </label>
  ),
);
Select.displayName = "Select";
