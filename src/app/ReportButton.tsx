"use client";

import { Button } from "@/shared";
import { useState } from "react";
import { ReportModal } from "@/app/ReportModal";

export function ReportButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Отчеты</Button>
      <ReportModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
