"use client";

import { useTransition } from "react";

import { updateApplicationStatus } from "@/shared/actions";
import { Badge, Select } from "@/shared/ui";

const statusOptions = [
  { value: "pending", label: "На рассмотрении" },
  { value: "invited", label: "Пригласить" },
  { value: "rejected", label: "Отклонить" },
  { value: "hired", label: "Принят" },
];

interface ApplicationStatusControlsProps {
  applicationId: number;
  currentStatus: "pending" | "invited" | "rejected" | "hired";
}

export function ApplicationStatusControls({
  applicationId,
  currentStatus,
}: ApplicationStatusControlsProps) {
  const [isPending, startTransition] = useTransition();

  const changeStatus = (status: string) => {
    if (!status || status === currentStatus) return;
    startTransition(async () => {
      await updateApplicationStatus({
        applicationId,
        status: status as "pending" | "invited" | "rejected" | "hired",
      });
    });
  };

  return (
    <div className="flex flex-col items-end gap-2 md:flex-row md:items-center">
      <Select
        className="md:w-44"
        label="Статус отклика"
        options={statusOptions}
        value={currentStatus}
        onChange={(event) => changeStatus(event.target.value)}
        aria-label="Изменить статус отклика"
      />
      {isPending && <Badge variant="neutral">Обновляем...</Badge>}
    </div>
  );
}
