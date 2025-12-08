"use client";

import { useState, useTransition } from "react";
import {
  type FeedbackStatus,
  updateFeedbackStatus,
} from "@/app/actions/feedbacks";

const statusLabels: Record<FeedbackStatus, string> = {
  new: "Новое",
  in_progress: "В работе",
  resolved: "Готово",
};

export default function FeedbackStatusControl({
  id,
  initialStatus,
}: {
  id: number;
  initialStatus: FeedbackStatus;
}) {
  const [value, setValue] = useState<FeedbackStatus>(initialStatus);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleChange = (next: FeedbackStatus) => {
    setValue(next);
    setError(null);
    startTransition(async () => {
      const result = await updateFeedbackStatus(id, next);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="space-y-1">
      <select
        value={value}
        onChange={(event) => handleChange(event.target.value as FeedbackStatus)}
        disabled={pending}
        className="rounded-xl border-2 border-[#d2a06f] bg-white px-3 py-2 text-sm font-semibold text-[#5e4632]"
      >
        {Object.entries(statusLabels).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-[#b73d3d]">{error}</p>}
    </div>
  );
}
