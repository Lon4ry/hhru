import { Card } from "./card";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
}

export function StatsCard({ title, value, description }: StatsCardProps) {
  return (
    <Card className="flex flex-col gap-2">
      <span className="text-sm text-slate-500">{title}</span>
      <span className="text-3xl font-semibold text-slate-900">{value}</span>
      {description && (
        <span className="text-xs text-slate-500">{description}</span>
      )}
    </Card>
  );
}
