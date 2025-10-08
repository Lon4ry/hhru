"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type { User, Company, Resume } from "@prisma/client";

import {
  Button,
  Card,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHeadCell,
  TableHeader,
  TableRow,
} from "@/shared/ui";

interface UsersTableProps {
  users: (User & { company: Company | null; resume: Resume | null })[];
  initialQuery: string;
  initialRole: string;
}

const roleOptions = [
  { label: "Все роли", value: "" },
  { label: "Соискатели", value: "APPLICANT" },
  { label: "Работодатели", value: "EMPLOYER" },
  { label: "Администраторы", value: "ADMIN" },
];

export function UsersTable({
  users,
  initialQuery,
  initialRole,
}: UsersTableProps) {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      q: initialQuery,
      role: initialRole,
    },
  });

  const csvData = useMemo(() => {
    const header = ["Email", "Имя", "Роль", "Телефон", "Компания/Должность"];
    const rows = users.map((user) => [
      user.email,
      `${user.lastName} ${user.firstName}`.trim(),
      translateRole(user.role),
      user.phone ?? "",
      user.role === "EMPLOYER"
        ? (user.company?.name ?? "")
        : (user.resume?.desiredPosition ?? ""),
    ]);
    return [header, ...rows]
      .map((row) => row.map((col) => `"${col}"`).join(";"))
      .join("\n");
  }, [users]);

  const downloadCsv = () => {
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "users.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const submit = form.handleSubmit((values) => {
    const params = new URLSearchParams();
    if (values.q) params.set("q", values.q);
    if (values.role) params.set("role", values.role);
    const query = params.toString();
    router.push(query ? `/admin/users?${query}` : "/admin/users");
  });

  return (
    <div className="grid gap-4">
      <Card>
        <form
          className="grid gap-4 md:grid-cols-[2fr_1fr_auto]"
          onSubmit={submit}
        >
          <Input
            label="Поиск"
            placeholder="Email или фамилия"
            {...form.register("q")}
          />
          <Select
            label="Роль"
            options={roleOptions}
            value={form.watch("role")}
            onChange={(event) => form.setValue("role", event.target.value)}
          />
          <div className="flex items-end gap-2">
            <Button type="submit">Применить</Button>
            <Button type="button" variant="outline" onClick={downloadCsv}>
              Экспорт CSV
            </Button>
          </div>
        </form>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHeadCell>Email</TableHeadCell>
            <TableHeadCell>ФИО</TableHeadCell>
            <TableHeadCell>Роль</TableHeadCell>
            <TableHeadCell>Телефон</TableHeadCell>
            <TableHeadCell>Компания / Резюме</TableHeadCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{`${user.lastName} ${user.firstName}`}</TableCell>
              <TableCell>{translateRole(user.role)}</TableCell>
              <TableCell>{user.phone ?? "—"}</TableCell>
              <TableCell>
                {user.role === "EMPLOYER"
                  ? (user.company?.name ?? "—")
                  : (user.resume?.desiredPosition ?? "—")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function translateRole(role: string) {
  switch (role) {
    case "APPLICANT":
      return "Соискатель";
    case "EMPLOYER":
      return "Работодатель";
    case "ADMIN":
      return "Администратор";
    default:
      return role;
  }
}
