'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Plus, Users } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Classroom {
  _id: string;
  name: string;
  vacancy: number;
  students: string[];
  school: string;
}


export default function ClassroomsPage() {
  const { data: session, status } = useSession()
  const [classrooms, setClassrooms] = useState([])
  const [newClassroom, setNewClassroom] = useState({ name: '', vacancy: '' })
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [updatingClassroom, setUpdatingClassroom] = useState<{ _id: string; name: string; vacancy: number } | null>(null);

  const handleUpdateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingClassroom) return;
    try {
      const res = await fetch(`/api/classrooms`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({ _id: updatingClassroom._id, name: updatingClassroom.name, vacancy: updatingClassroom.vacancy }),
      });
      if (!res.ok) throw new Error('Failed to update classroom');
      fetchClassrooms();
      toast({
        title: "Success",
        description: "Classroom updated successfully",
      });
      setUpdatingClassroom(null);
    } catch (error) {
      console.error('Failed to update classroom:', error);
      toast({
        title: "Error",
        description: "Failed to update classroom",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClassroom = async (id: string) => {
    if (!confirm('Are you sure you want to delete this classroom?')) return;
    try {
      const res = await fetch(`/api/classrooms`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({ _id: id }),
      });
      if (!res.ok) throw new Error('Failed to delete classroom');
      fetchClassrooms();
      toast({
        title: "Success",
        description: "Classroom deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete classroom:', error);
      toast({
        title: "Error",
        description: "Failed to delete classroom",
        variant: "destructive",
      });
    }
  };
  const { toast } = useToast()

  useEffect(() => {
    if (status === 'authenticated') {

      console.log('authhead', session?.accessToken)
      fetchClassrooms()
    }
  }, [status])

  const fetchClassrooms = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/classrooms')
      if (!res.ok) throw new Error('Failed to fetch classrooms')
      const data = await res.json()
      setClassrooms(data.classrooms)
    } catch (error) {
      console.error('Error fetching classrooms:', error)
      toast({
        title: "Error",
        description: "Failed to fetch classrooms",
        variant: "destructive",
      })
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
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({ ...newClassroom, vacancy: parseInt(newClassroom.vacancy), school: session?.user.school }),
      })
      if (!res.ok) throw new Error('Failed to create classroom')
      setNewClassroom({ name: '', vacancy: '' })
      fetchClassrooms()
      toast({
        title: "Success",
        description: "Classroom created successfully",
      })
    } catch (error) {
      console.error('Failed to create classroom:', error)
      toast({
        title: "Error",
        description: "Failed to create classroom",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8" /></div>
  }

  // if (session?.user.role === 'superadmin') {
  //   return <div className="text-center mt-8">Access denied. Superadmins cannot manage classrooms directly.</div>
  // }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Manage Classrooms</h1>
        <Button onClick={() => document.getElementById('newClassroomForm')?.scrollIntoView({ behavior: 'smooth' })}>
          <Plus className="mr-2 h-4 w-4" /> Add New Classroom
        </Button>
      </div>
  
      <Card>
        <CardHeader>
          <CardTitle>Existing Classrooms</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Vacancy</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classrooms.map((classroom: Classroom) => (
                  <TableRow key={classroom._id}>
                    <TableCell className="font-medium">{classroom.name}</TableCell>
                    <TableCell>{classroom.vacancy}</TableCell>
                    <TableCell>{classroom.students?.length || 0}</TableCell>
                    <TableCell>
                      <Button onClick={() => setUpdatingClassroom(classroom)}>Update</Button>
                      <Button onClick={() => handleDeleteClassroom(classroom._id)} variant="destructive">Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
  
      <Card id="newClassroomForm">
        <CardHeader>
          <CardTitle>Create New Classroom</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateClassroom} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Classroom Name</Label>
              <Input
                id="name"
                value={newClassroom.name}
                onChange={(e) => setNewClassroom({ ...newClassroom, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
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
              {creating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Users className="mr-2 h-4 w-4" />}
              Create Classroom
            </Button>
          </form>
        </CardContent>
      </Card>
  
      {updatingClassroom && (
        <Card>
          <CardHeader>
            <CardTitle>Update Classroom</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateClassroom} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Classroom Name</Label>
                <Input
                  id="name"
                  value={updatingClassroom.name}
                  onChange={(e) => setUpdatingClassroom({ ...updatingClassroom, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vacancy">Vacancy</Label>
                <Input
                  id="vacancy"
                  type="number"
                  value={updatingClassroom.vacancy}
                  onChange={(e) => setUpdatingClassroom({ ...updatingClassroom, vacancy: parseInt(e.target.value) })}
                  required
                />
              </div>
              <Button type="submit">Update Classroom</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}