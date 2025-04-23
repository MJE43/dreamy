import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import SessionProvider from "@/components/auth/SessionProvider";
import Header from "@/components/layout/Header";
import { LiveRegionProvider } from "@/context/LiveRegionContext";
import SupabaseProvider from "@/components/providers/SupabaseProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Dreamy - Dream Analysis",
  description: "Analyze your dreams with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased font-sans bg-background text-foreground`}
      >
        <SupabaseProvider>
          <SessionProvider>
            <LiveRegionProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">
                  {children}
                </main>
              </div>
              <Toaster 
                richColors 
                position="bottom-center" 
                theme="dark"
              />
            </LiveRegionProvider>
          </SessionProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
