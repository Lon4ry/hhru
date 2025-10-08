import { cn } from "@/shared/lib/utils";

const variantMap = {
  neutral: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
};

type BadgeVariant = keyof typeof variantMap;

export function Badge({ children, variant = "neutral" }: { children: React.ReactNode; variant?: BadgeVariant }) {
  return <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", variantMap[variant])}>{children}</span>;
}
