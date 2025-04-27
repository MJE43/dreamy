import { Metadata } from "next";
import CoachChat from "@/components/CoachChat";

export const metadata: Metadata = {
  title: "Spiral Coach",
  description: "Your personal growth assistant",
};

// Simplified page component - no longer needs searchParams handling
export default function CoachPage() {
  return (
    <div className="h-full">
      <CoachChat />
    </div>
  );
}
