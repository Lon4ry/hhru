import { Button } from "./button";

interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
}

export function Pagination({ page, total, pageSize }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-between gap-2">
      <Button asChild size="sm" variant="outline" disabled={page <= 1}>
        <a href={`?page=${page - 1}`}>Назад</a>
      </Button>
      <span className="text-sm text-slate-500">
        Страница {page} из {totalPages}
      </span>
      <Button asChild size="sm" variant="outline" disabled={page >= totalPages}>
        <a href={`?page=${page + 1}`}>Вперёд</a>
      </Button>
    </div>
  );
}
