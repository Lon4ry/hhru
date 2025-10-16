"use client";

import { Dialog, Label, Select } from "radix-ui";
import { useState } from "react";
import { cn } from "@/shared";
import { ChevronDownIcon, ChevronUpIcon, XIcon } from "lucide-react";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
}

export function ReportModal({ open, onClose }: ReportModalProps) {
  const [type, setType] = useState("users");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${type}`, {
        method: "GET",
      });
      if (!res.ok) throw new Error("Ошибка генерации отчёта");

      // Получаем blob Excel-файла
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Отчёт_${type}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (_) {
      alert("Ошибка при создании отчёта");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-md space-y-5 rounded-xl bg-white p-6 shadow-xl",
          )}
        >
          <Dialog.Title className="text-lg font-semibold">
            Создание отчёта
          </Dialog.Title>

          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <Label.Root className="text-sm font-medium">
                Тип отчёта
              </Label.Root>
              <Select.Root value={type} onValueChange={setType}>
                <Select.Trigger className="flex justify-between rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500">
                  <Select.Value placeholder="Выберите отчёт" />
                  <Select.Icon>
                    <ChevronDownIcon />
                  </Select.Icon>
                </Select.Trigger>

                <Select.Portal>
                  <Select.Content className="rounded-md border bg-white shadow-md">
                    <Select.ScrollUpButton className="flex justify-center">
                      <ChevronUpIcon />
                    </Select.ScrollUpButton>

                    <Select.Viewport className="p-2">
                      <Select.Item
                        value="users"
                        className="cursor-pointer rounded px-3 py-2 hover:bg-gray-100"
                      >
                        <Select.ItemText>
                          Сведения о соискателях и работодателях
                        </Select.ItemText>
                      </Select.Item>
                      <Select.Item
                        value="movement"
                        className="cursor-pointer rounded px-3 py-2 hover:bg-gray-100"
                      >
                        <Select.ItemText>Движение кадров</Select.ItemText>
                      </Select.Item>
                      <Select.Item
                        value="structure"
                        className="cursor-pointer rounded px-3 py-2 hover:bg-gray-100"
                      >
                        <Select.ItemText>Структура занятости</Select.ItemText>
                      </Select.Item>
                      <Select.Item
                        value="dynamics"
                        className="cursor-pointer rounded px-3 py-2 hover:bg-gray-100"
                      >
                        <Select.ItemText>
                          Динамика трудоустройства
                        </Select.ItemText>
                      </Select.Item>
                      <Select.Item
                        value="forecast"
                        className="cursor-pointer rounded px-3 py-2 hover:bg-gray-100"
                      >
                        <Select.ItemText>
                          Прогноз потребности в кадрах
                        </Select.ItemText>
                      </Select.Item>
                      <Select.Item
                        value="popular"
                        className="cursor-pointer rounded px-3 py-2 hover:bg-gray-100"
                      >
                        <Select.ItemText>
                          Рейтинг востребованных профессий
                        </Select.ItemText>
                      </Select.Item>
                    </Select.Viewport>

                    <Select.ScrollDownButton className="flex justify-center">
                      <ChevronDownIcon />
                    </Select.ScrollDownButton>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Dialog.Close asChild>
              <button
                onClick={onClose}
                className="rounded-md border px-4 py-2 text-sm hover:bg-gray-100"
              >
                Отмена
              </button>
            </Dialog.Close>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Создание..." : "Сформировать"}
            </button>
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute top-3 right-3 rounded-full p-1 text-gray-500 hover:bg-gray-100"
              aria-label="Закрыть"
            >
              <XIcon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
