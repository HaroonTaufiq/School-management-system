'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        {session?.user && (
          <div className="flex items-center">
            <span className="mr-4">{session.user?.email}</span>
            <Button onClick={() => signOut()}>Sign out</Button>
          </div>
        )}
      </div>
    </header>
  )
}

