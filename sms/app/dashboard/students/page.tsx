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
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Plus, UserPlus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function StudentsPage() {
  const { status } = useSession()
  const { toast } = useToast()
  const [students, setStudents] = useState<Student[]>([])
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [newStudent, setNewStudent] = useState({ username: '', classroom: '' })
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [updatingStudent, setUpdatingStudent] = useState<{ _id: string; username: string; classroom: string } | null>(null);

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingStudent) return; // Ensure there's a student to update

    try {
      setCreating(true);
      const res = await fetch(`/api/students`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: updatingStudent._id, username: updatingStudent.username, classroom: updatingStudent.classroom }),
      });
      if (!res.ok) throw new Error('Failed to update student');
      fetchStudents(); // Refresh the student list
      setUpdatingStudent(null); // Clear the updating student state
      toast({
        title: "Success",
        description: "Student updated successfully",
      });
    } catch (error) {
      console.error('Failed to update student:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update student"
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      const res = await fetch(`/api/students`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: studentId }),
      });
      if (!res.ok) throw new Error('Failed to delete student');
      fetchStudents(); // Refresh the student list
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete student:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete student"
      });
    }
  };


  useEffect(() => {
    if (status === 'authenticated') {
      fetchStudents()
      fetchClassrooms()
    }
  }, [status])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/students')
      if (!res.ok) throw new Error('Failed to fetch students')
      const data = await res.json()
      setStudents(data.students)
    } catch (error) {
      console.error('Error fetching students:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch students"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchClassrooms = async () => {
    try {
      const res = await fetch('/api/classrooms')
      if (!res.ok) throw new Error('Failed to fetch classrooms')
      const data = await res.json()
    console.log(data)
      setClassrooms(data.classrooms)
    } catch (error) {
      console.error('Error fetching classrooms:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch classrooms"
      })
    }
  }

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setCreating(true)
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent),
      })
      if (!res.ok) throw new Error('Failed to create student')
      setNewStudent({ username: '', classroom: '' })
      fetchStudents()
      toast({
        title: "Success",
        description: "Student created successfully",
      })
    } catch (error) {
      console.error('Failed to create student:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create student"
      })
    } finally {
      setCreating(false)
    }
  }

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8" /></div>
  }

  // if (session?.user.role === 'superadmin') {
  //   return <div className="text-center mt-8">Access denied. Superadmins cannot manage students directly.</div>
  // }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Manage Students</h1>
        <Button onClick={() => document.getElementById('newStudentForm')?.scrollIntoView({ behavior: 'smooth' })}>
          <Plus className="mr-2 h-4 w-4" /> Add New Student
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existing Students</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Classroom</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell className="font-medium">{student.username}</TableCell>
                    <TableCell>{student.classroom}</TableCell>
                    <TableCell>
                      <Button onClick={() => setUpdatingStudent(student)}>Edit</Button>
                      <Button onClick={() => handleDeleteStudent(student._id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card id="newStudentForm">
        <CardHeader>
          <CardTitle>Create New Student</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateStudent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Student Username</Label>
              <Input
                id="username"
                value={newStudent.username}
                onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classroom">Classroom</Label>
              <Select
                value={newStudent.classroom}
                onValueChange={(value) => setNewStudent({ ...newStudent, classroom: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a classroom" />
                </SelectTrigger>
                <SelectContent>
                  {classrooms.map((classroom) => (
                    <SelectItem key={classroom._id} value={classroom.name}>
                      {classroom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={creating}>
              {creating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Create Student
            </Button>
          </form>
        </CardContent>
      </Card>

      { updatingStudent && (
        <Card>
          <CardHeader>
            <CardTitle>Update Student</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Student Username</Label>
                <Input
                  id="username"
                  value={updatingStudent.username}
                  onChange={(e) => setUpdatingStudent({ ...updatingStudent, username: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classroom">Classroom</Label>
                <Select
                  value={updatingStudent.classroom}
                  onValueChange={(value) => setUpdatingStudent({ ...updatingStudent, classroom: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a classroom" />
                  </SelectTrigger>
                  <SelectContent>
                    {classrooms.map((classroom) => (
                      <SelectItem key={classroom._id} value={classroom.name}>
                        {classroom.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={creating}>
                {creating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Update Student
              </Button>
            </form>
          </CardContent>
        </Card>


     ) }
    </div>
  )
}