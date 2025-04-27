import Link from 'next/link';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Coach Chat'
};

export default function CoachLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="bg-background border-b border-border px-6 py-3 flex items-center space-x-4 sticky top-0 z-10 h-14">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          aria-label="Back to dashboard"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-arrow-left"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          <span>Dashboard</span>
        </Link>
      </header>
      <main className="flex-1 relative">{children}</main>
    </div>
  );
} 
