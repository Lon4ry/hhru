"use client";

import { useTransition } from "react";

import { respondToInterviewInvitation } from "@/shared/actions";
import { Button } from "@/shared/ui";

interface ApplicationResponseButtonsProps {
  applicationId: number;
  applicantId: number;
}

export function ApplicationResponseButtons({
  applicationId,
  applicantId,
}: ApplicationResponseButtonsProps) {
  const [isPending, startTransition] = useTransition();

  const respond = (decision: "accept" | "decline") => {
    startTransition(async () => {
      await respondToInterviewInvitation({
        applicationId,
        applicantId,
        decision,
      });
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        loading={isPending}
        onClick={() => respond("accept")}
      >
        Согласиться
      </Button>
      <Button
        size="sm"
        variant="secondary"
        loading={isPending}
        onClick={() => respond("decline")}
      >
        Отказаться
      </Button>
    </div>
  );
}
