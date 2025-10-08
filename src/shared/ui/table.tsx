import { cn } from "@/shared/lib/utils";

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return <table className={cn("w-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-left", className)}>{children}</table>;
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-slate-100 text-sm text-slate-700">{children}</tbody>;
}

export function TableRow({ children }: { children: React.ReactNode }) {
  return <tr className="hover:bg-slate-50/60">{children}</tr>;
}

export function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3", className)}>{children}</td>;
}

export function TableHeadCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("px-4 py-3 font-semibold", className)}>{children}</th>;
}
