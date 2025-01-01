'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import type { Session } from 'next-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Toast } from '../../components/toast'
import { Loader2 } from 'lucide-react'

interface School {
  _id: string;
  name: string;
  location: string;
  classrooms: string[];
}

export default function SchoolsPage() {
  const { data: session, status } = useSession() as { data: Session | null, status: string }
  const [schools, setSchools] = useState<School[]>([])
  const [newSchool, setNewSchool] = useState({ name: '', location: '' })
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSchools()
    }
  }, [status])

  const fetchSchools = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/schools')
      if (!res.ok) throw new Error('Failed to fetch schools')
      const data = await res.json()
      setSchools(data.schools)
    } catch (error) {
      console.error('Error fetching schools:', error)
      setToast({ message: 'Failed to fetch schools', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setCreating(true)
      const res = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchool),
      })
      if (!res.ok) throw new Error('Failed to create school')
      setNewSchool({ name: '', location: '' })
      fetchSchools()
      setToast({ message: 'School created successfully', type: 'success' })
    } catch (error) {
      console.error('Failed to create school:', error)
      setToast({ message: 'Failed to create school', type: 'error' })
    } finally {
      setCreating(false)
    }
  }

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>
  }

  if (!session?.user.isAdmin) {
    return <div>Access denied. You must be a superadmin to view this page.</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Schools</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New School</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateSchool} className="space-y-4">
            <div>
              <Label htmlFor="name">School Name</Label>
              <Input
                id="name"
                value={newSchool.name}
                onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={newSchool.location}
                onChange={(e) => setNewSchool({ ...newSchool, location: e.target.value })}
                required
              />
            </div>
            <Button type="submit" disabled={creating}>
              {creating ? <Loader2 className="animate-spin mr-2" /> : null}
              Create School
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Existing Schools</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
          ) : (
            <ul className="space-y-2">
              {schools.map((school: School) => (
                <li key={school._id} className="flex justify-between items-center">
                  <span>{school.name} - {school.location}</span>
                  <span>Classrooms: {school.classrooms.length}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
