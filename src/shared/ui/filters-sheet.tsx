"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { FilterIcon } from "lucide-react";

import { Button } from "./button";

interface FiltersSheetProps {
  children: React.ReactNode;
  title: string;
  triggerLabel?: string;
}

export function FiltersSheet({ children, title, triggerLabel = "Фильтры" }: FiltersSheetProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button size="sm" variant="outline" className="md:hidden">
          <FilterIcon className="mr-2 h-4 w-4" />
          {triggerLabel}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-md flex-col rounded-t-3xl bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-slate-900">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">Закрыть</button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Используйте элементы формы ниже, чтобы настроить параметры фильтрации.
          </Dialog.Description>
          <div className="flex-1 overflow-y-auto">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
