"use client";

import * as React from "react";

import { cn } from "@/shared/lib/utils";

interface ChipInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

export function ChipInput({
  value,
  onChange,
  label,
  placeholder,
  error,
}: ChipInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const inputId = React.useId();

  const addChip = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setInputValue("");
  };

  const removeChip = (chip: string) => {
    onChange(value.filter((item) => item !== chip));
  };

  return (
    <div className="flex flex-col gap-2 text-sm text-slate-700">
      {label && (
        <label className="font-medium text-slate-800" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex min-h-12 flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2",
          error ? "border-red-400" : "",
        )}
      >
        {value.length === 0 && !inputValue && (
          <span aria-hidden className="text-xs text-slate-400">
            {placeholder ?? "Введите и нажмите Enter"}
          </span>
        )}
        {value.map((chip) => (
          <span
            key={chip}
            className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
          >
            {chip}
            <button
              type="button"
              className="text-slate-500"
              onClick={() => removeChip(chip)}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={inputId}
          placeholder={placeholder ?? "Введите и нажмите Enter"}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className="flex-1 border-none bg-transparent text-sm text-slate-900 focus:outline-none"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addChip();
            }
            if (event.key === "Backspace" && !inputValue) {
              onChange(value.slice(0, -1));
            }
          }}
        />
        <button
          type="button"
          onClick={addChip}
          className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800"
        >
          Добавить
        </button>
      </div>
      {error && (
        <span id={`${inputId}-error`} className="text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}
