import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  const merged = twMerge(clsx(...inputs));
  const unique = Array.from(new Set(merged.split(/\s+/).filter(Boolean)));
  return unique.join(" ");
}

export const formatCurrency = (value?: number | null) => {
  if (!value && value !== 0) return "По договорённости";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return "";
  const instance = typeof date === "string" ? new Date(date) : date;
  return instance.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
