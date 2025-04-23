'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from "next-themes"
import { Moon, Sun, Settings } from "lucide-react"
import { Button } from '@/components/ui/button'
import { useUser } from '@supabase/auth-helpers-react'
import SignOutButton from '@/components/auth/SignOutButton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

function SettingsMenu() {
  const handleExport = () => {
    console.log("TODO: Implement dream export");
    alert("Export functionality not yet implemented.");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
           <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExport}>Export Dreams</DropdownMenuItem>
        <DropdownMenuItem asChild>
           <a href="mailto:feedback@example.com">Send Feedback</a> 
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <SignOutButton variant="ghost" className="w-full justify-start p-0 font-normal" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function Header() {
  const user = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user !== undefined) {
      setIsLoading(false);
    }
  }, [user]);

  return (
    <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-10">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group">
           <Moon className="h-6 w-6 text-primary group-hover:rotate-[-15deg] transition-transform duration-300 ease-in-out" />
        </Link>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {isLoading ? (
            <div className="h-8 w-20 rounded-md bg-muted animate-pulse"></div>
          ) : user ? (
            <>
              <ThemeToggle />
              <SettingsMenu />
            </>
          ) : (
            <>
              <ThemeToggle />
              <Button size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
} 
