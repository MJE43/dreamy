import Link from 'next/link';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Coach Chat'
};

export default function CoachLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center space-x-4 sticky top-0 z-10">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          ← Dashboard
        </Link>
        <span className="font-semibold text-lg">Spiral Coach</span>
      </header>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
} 
