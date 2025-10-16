import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import {
  getUsersStatistics,
  getEmploymentMovementReport,
  getEmploymentStructure,
  getEmploymentDynamicsReport,
  getWorkforceDemandForecast,
  getPopularProfessions,
} from "@/app/reports";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  let worksheetData = [];
  let sheetName = "Отчёт";

  switch ((await params).type) {
    case "users": {
      const localData = await getUsersStatistics();
      sheetName = "Соискатели и работодатели";
      worksheetData = [
        {
          "Всего соискателей": localData.totalApplicants,
          "Всего работодателей": localData.totalEmployers,
          "Новых соискателей за 30 дней": localData.newApplicants,
          "Новых работодателей за 30 дней": localData.newEmployers,
        },
      ];
      break;
    }

    case "movement": {
      const localData = await getEmploymentMovementReport(
        new Date("2025-01-01"),
        new Date(),
      );
      sheetName = "Движение кадров";
      worksheetData = [
        {
          Принятые: localData.hired,
          Отклонённые: localData.rejected,
          "В ожидании": localData.pending,
        },
      ];
      break;
    }

    case "structure": {
      const localData = await getEmploymentStructure();
      sheetName = "Структура занятости";
      worksheetData = [
        { Город: "—", "Количество вакансий": "" },
        ...localData.byRegion.map((r) => ({
          Город: r.city || "Не указан",
          "Количество вакансий": r._count.id,
        })),
        {},
        { "Тип занятости": "—", "Количество вакансий": "" },
        ...localData.byEmploymentType.map((t) => ({
          "Тип занятости": t.employmentType || "Не указан",
          "Количество вакансий": t._count.id,
        })),
      ];
      break;
    }

    case "dynamics": {
      const localData = await getEmploymentDynamicsReport("month");
      sheetName = "Динамика трудоустройства";
      worksheetData = localData.map((d) => ({
        Период: d.period,
        "Количество трудоустроенных": d.count,
      }));
      break;
    }

    case "forecast": {
      const localData = await getWorkforceDemandForecast();
      sheetName = "Прогноз потребности";
      worksheetData = [
        { Регион: "—", "Количество вакансий": "" },
        ...localData.byRegion.map((r) => ({
          Регион: r.city || "Не указан",
          "Количество вакансий": r._count.id,
        })),
        {},
        { Профессия: "—", "Количество вакансий": "" },
        ...localData.byProfession.map((p) => ({
          Профессия: p.title || "Не указана",
          "Количество вакансий": p._count.id,
        })),
      ];
      break;
    }

    case "popular": {
      const localData = await getPopularProfessions();
      sheetName = "Рейтинг профессий";
      worksheetData = localData.map((p, i) => ({
        Место: i + 1,
        Профессия: p.title,
        Отрасль: p.specialization || "Не указана",
        "Количество заявок": p.applications,
      }));
      break;
    }
    default:
      return NextResponse.json(
        { error: "Неизвестный тип отчёта" },
        { status: 400 },
      );
  }

  // --- Формируем Excel ---
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=${encodeURIComponent(
        sheetName,
      )}.xlsx`,
    },
  });
}
