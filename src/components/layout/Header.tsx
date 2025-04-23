'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Moon } from "lucide-react"
import { Button } from '@/components/ui/button'
import { useUser } from '@supabase/auth-helpers-react'
import SignOutButton from '@/components/auth/SignOutButton'

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
           <span className="font-semibold text-lg group-hover:text-primary transition-colors">Dreamy</span>
        </Link>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {isLoading ? (
            <div className="h-8 w-24 rounded-md bg-muted animate-pulse"></div>
          ) : user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                 <Link href="/dream">New Dream</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dreams">Past Dreams</Link>
              </Button>
              <SignOutButton variant="ghost" size="sm" />
            </>
          ) : (
            <Button size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
} 
