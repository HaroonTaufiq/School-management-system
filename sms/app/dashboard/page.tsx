'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, School, Users, BookOpen, User } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8" /></div>
  }

  if (!session) {
    return <div className="text-center mt-8">Access denied. Please log in to view this page.</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {session.user.role === 'superadmin' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">10(dummy)</div>
              <p className="text-xs text-muted-foreground">Across all regions</p>
            </CardContent>
          </Card>
        )}
        
        {session.user.role !== 'superadmin' && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Classrooms</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">25</div>
                <p className="text-xs text-muted-foreground">In your school</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">500</div>
                <p className="text-xs text-muted-foreground">Enrolled in your school</p>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{session.user.role}</div>
            <p className="text-xs text-muted-foreground">{session.user.email}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {session.user.role === 'superadmin' && (
          <Card>
            <CardHeader>
              <CardTitle>Manage Schools</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Add, edit, or remove schools from the system.</p>
              <Button asChild>
                <Link href="/dashboard/schools">
                  <School className="mr-2 h-4 w-4" /> Go to Schools
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {session.user.role !== 'superadmin' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Manage Classrooms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Add, edit, or remove classrooms in your school.</p>
                <Button asChild>
                  <Link href="/dashboard/classrooms">
                    <BookOpen className="mr-2 h-4 w-4" /> Go to Classrooms
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manage Students</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Add, edit, or remove students in your school.</p>
                <Button asChild>
                  <Link href="/dashboard/students">
                    <Users className="mr-2 h-4 w-4" /> Go to Students
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">View and edit your profile information.</p>
            <Button asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" /> Go to Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

