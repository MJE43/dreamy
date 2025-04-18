'use client'

import React from 'react'
import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Header() {
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'

  return (
    <header className="bg-background border-b sticky top-0 z-10">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          Dreamy
        </Link>
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="h-8 w-20 rounded-md bg-muted animate-pulse"></div> // Simple skeleton loader
          ) : session?.user ? (
            <>
              <span className="text-sm hidden sm:inline">
                Signed in as {session.user.name || session.user.email}
              </span>
               <Avatar className="h-8 w-8">
                  {session.user.image && <AvatarImage src={session.user.image} alt={session.user.name || 'User avatar'} />}
                  <AvatarFallback>{session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}</AvatarFallback>
               </Avatar>
              <Button variant="outline" size="sm" onClick={() => signOut()}>Sign Out</Button>
            </>
          ) : (
            <Button size="sm" onClick={() => signIn('github')}>Sign In with GitHub</Button>
          )}
        </div>
      </nav>
    </header>
  )
} 
