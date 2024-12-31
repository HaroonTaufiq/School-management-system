'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { School, Users, BookOpen } from 'lucide-react'

export function Sidebar() {
  const { data: session } = useSession()

  return (
    <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <nav>
        {session?.user?.isAdmin && (
          <Link href="/dashboard/schools" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
            <School className="inline-block mr-2" />
            Schools
          </Link>
        )}
        <Link href="/dashboard/classrooms" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
          <BookOpen className="inline-block mr-2" />
          Classrooms
        </Link>
        <Link href="/dashboard/students" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
          <Users className="inline-block mr-2" />
          Students
        </Link>
      </nav>
    </div>
  )
}

