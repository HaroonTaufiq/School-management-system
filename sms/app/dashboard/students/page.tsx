'use client'

interface Classroom {
  _id: string
  name: string
}

interface Student {
  _id: string
  username: string
  classroom: string
}

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function StudentsPage() {
  const { data: session } = useSession()
  const [students, setStudents] = useState([])
  const [classrooms, setClassrooms] = useState([])
  const [newStudent, setNewStudent] = useState({ username: '', classroom: '' })

  useEffect(() => {
    fetchStudents()
    fetchClassrooms()
  }, [])

  const fetchStudents = async () => {
    const res = await fetch('/api/students')
    const data = await res.json()
    setStudents(data.students)
  }

  const fetchClassrooms = async () => {
    const res = await fetch('/api/classrooms')
    const data = await res.json()
    setClassrooms(data.classrooms)
  }

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudent),
    })
    if (res.ok) {
      setNewStudent({ username: '', classroom: '' })
      fetchStudents()
    } else {
      // Handle error
      console.error('Failed to create student')
    }
  }

  if (session?.user.isAdmin) {
    return <div>Access denied. Superadmins cannot manage students directly.</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Students</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Student</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateStudent} className="space-y-4">
            <div>
              <Label htmlFor="username">Student Username</Label>
              <Input
                id="username"
                value={newStudent.username}
                onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="classroom">Classroom</Label>
              <Select
                value={newStudent.classroom}
                onValueChange={(value) => setNewStudent({ ...newStudent, classroom: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a classroom" />
                </SelectTrigger>
                <SelectContent>
                  {classrooms.map((classroom: Classroom) => (
                    <SelectItem key={classroom._id} value={classroom.name}>
                      {classroom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Create Student</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Existing Students</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {students.map((student: Student) => (
              <li key={student._id} className="flex justify-between items-center">
                <span>{student.username} - Classroom: {student.classroom}</span>
                {/* Add edit and delete functionality here */}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

