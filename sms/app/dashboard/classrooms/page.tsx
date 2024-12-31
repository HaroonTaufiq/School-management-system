'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Toast } from '../../components/toast'
import { Loader2 } from 'lucide-react'

export default function ClassroomsPage() {
  const { data: session, status } = useSession()
  const [classrooms, setClassrooms] = useState([])
  const [newClassroom, setNewClassroom] = useState({ name: '', vacancy: '', school: '' })
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchClassrooms()
    }
  }, [status])

  const fetchClassrooms = async () => {
    try {
      setLoading(true)
      const res = awaitfetch('/api/classrooms')
      if (!res.ok) throw new Error('Failed to fetch classrooms')
      const data = await res.json()
      setClassrooms(data.classrooms)
    } catch (error) {
      console.error('Error fetching classrooms:', error)
      setToast({ message: 'Failed to fetch classrooms', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setCreating(true)
      const res = await fetch('/api/classrooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newClassroom, vacancy: parseInt(newClassroom.vacancy), school: session?.user.school }),
      })
      if (!res.ok) throw new Error('Failed to create classroom')
      setNewClassroom({ name: '', vacancy: '', school: '' })
      fetchClassrooms()
      setToast({ message: 'Classroom created successfully', type: 'success' })
    } catch (error) {
      console.error('Failed to create classroom:', error)
      setToast({ message: 'Failed to create classroom', type: 'error' })
    } finally {
      setCreating(false)
    }
  }

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>
  }

  if (session?.user.isAdmin) {
    return <div>Access denied. Superadmins cannot manage classrooms directly.</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Classrooms</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Classroom</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateClassroom} className="space-y-4">
            <div>
              <Label htmlFor="name">Classroom Name</Label>
              <Input
                id="name"
                value={newClassroom.name}
                onChange={(e) => setNewClassroom({ ...newClassroom, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="vacancy">Vacancy</Label>
              <Input
                id="vacancy"
                type="number"
                value={newClassroom.vacancy}
                onChange={(e) => setNewClassroom({ ...newClassroom, vacancy: e.target.value })}
                required
              />
            </div>
            <Button type="submit" disabled={creating}>
              {creating ? <Loader2 className="animate-spin mr-2" /> : null}
              Create Classroom
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Existing Classrooms</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
          ) : (
            <ul className="space-y-2">
              {classrooms.map((classroom: any) => (
                <li key={classroom._id} className="flex justify-between items-center">
                  <span>{classroom.name}</span>
                  <span>Vacancy: {classroom.vacancy}</span>
                  <span>Students: {classroom.students.length}</span>
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

