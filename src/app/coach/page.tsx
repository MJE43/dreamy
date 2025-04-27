"use client";
import { useSearchParams } from "next/navigation";
import CoachChat from "@/components/CoachChat";

export default function CoachPage() {
  const params = useSearchParams();
  const draft = params.get("draft") || "";

  return (
    <div className="p-6">
      <CoachChat initialMessage={draft} />
    </div>
  );
}
