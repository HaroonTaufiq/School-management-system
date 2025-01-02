'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Plus, School } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface School {
  _id: string;
  name: string;
  location: string;
  classrooms: Array<{
    _id: string;
    name: string;
    vacancy: number;
    students: string[];
  }>;
  classroomIds: string[];
  adminIds: string[];
}

export default function SchoolsPage() {
  const { data: session, status } = useSession()
  const [schools, setSchools] = useState([])
  const [newSchool, setNewSchool] = useState({ name: '', location: '', classroomIds: [], adminIds: [] });
  const [updatingSchool, setUpdatingSchool] = useState<{ _id: string; name: string; location: string; classroomIds: string[]; adminIds: string[] } | null>(null);
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const handleUpdateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingSchool) return;
    try {
      const res = await fetch(`/api/schools`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({
          _id: updatingSchool._id,
          name: updatingSchool.name,
          location: updatingSchool.location,
          classroomIds: updatingSchool.classroomIds,
          adminIds: updatingSchool.adminIds
        }),

      });
      if (!res.ok) throw new Error('Failed to update school');
      fetchSchools();
      toast({
        title: "Success",
        description: "School updated successfully",
      });
      setUpdatingSchool(null);
    } catch (error) {
      console.error('Failed to update school:', error);
      toast({
        title: "Error",
        description: "Failed to update school",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSchool = async (id: string) => {
    if (!confirm('Are you sure you want to delete this school?')) return;
    try {
      const res = await fetch(`/api/schools`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({ name: id }),
      });
      if (!res.ok) throw new Error('Failed to delete school');
      fetchSchools();
      toast({
        title: "Success",
        description: "School deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete school:', error);
      toast({
        title: "Error",
        description: "Failed to delete school",
        variant: "destructive",
      });
    }
  };

  const { toast } = useToast()

  const fetchSchools = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/schools', {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to fetch schools')
      }
      const data = await res.json()
      setSchools(data.schools)
    } catch (error) {
      console.error('Error fetching schools:', error)
      toast({
        title: "Error",
        description: "Failed to fetch schools",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [session?.accessToken, toast, setLoading, setSchools])

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      fetchSchools()
    }
  }, [status, session, session?.accessToken, fetchSchools])

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setCreating(true)
      const res = await fetch('/api/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify(newSchool),
      })
      if (!res.ok) throw new Error('Failed to create school')
      setNewSchool({ name: '', location: '', classroomIds: [], adminIds: [] });
      fetchSchools()
      toast({
        title: "Success",
        description: "School created successfully",
      })
    } catch (error) {
      console.error('Failed to create school:', error)
      toast({
        title: "Error",
        description: "Failed to create school",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8" /></div>
  }

  // console.log('session',session)
  // if (!session?.user.isAdmin) {
  //   return <div>Access denied. You must be a superadmin to view this page.</div>
  // }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Manage Schools</h1>
        <Button onClick={() => document.getElementById('newSchoolForm')?.scrollIntoView({ behavior: 'smooth' })}>
          <Plus className="mr-2 h-4 w-4" /> Add New School
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existing Schools</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Classrooms</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((school: School) => (
                  <TableRow key={school._id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell>{school.location}</TableCell>
                    <TableCell>{school.classrooms?.length || 0}</TableCell>
                    <TableCell>
                      <Button onClick={() => setUpdatingSchool({
                        ...school,
                        classroomIds: school.classroomIds || [], // Ensure it's an array
                        adminIds: school.adminIds || [] // Ensure it's an array
                      })}>
                        Update
                      </Button>
                      <Button onClick={() => handleDeleteSchool(school.name)} variant="destructive">Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card id="newSchoolForm">
        <CardHeader>
          <CardTitle>Create New School</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateSchool} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">School Name</Label>
              <Input
                id="name"
                value={newSchool.name}
                onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={newSchool.location}
                onChange={(e) => setNewSchool({ ...newSchool, location: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classroomIds">Classroom IDs (comma-separated)</Label>
              <Input
                id="classroomIds"
                value={newSchool.classroomIds.join(', ')}
                onChange={(e) => setNewSchool({ ...newSchool, classroomIds: e.target.value.split(',').map(id => id.trim()) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminIds">Admin IDs (comma-separated)</Label>
              <Input
                id="adminIds"
                value={newSchool.adminIds.join(', ')}
                onChange={(e) => setNewSchool({ ...newSchool, adminIds: e.target.value.split(',').map(id => id.trim()) })}
                required
              />
            </div>
            <Button type="submit" disabled={creating}>
              {creating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <School className="mr-2 h-4 w-4" />}
              Create School
            </Button>
          </form>
        </CardContent>
      </Card>

      {updatingSchool && (
        <Card>
          <CardHeader>
            <CardTitle>Update School</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateSchool} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={updatingSchool.location}
                  onChange={(e) => setUpdatingSchool({ ...updatingSchool, location: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classroomIds">Classroom IDs (comma-separated)</Label>
                <Input
                  id="classroomIds"
                  value={updatingSchool.classroomIds.join(', ')}
                  onChange={(e) => setUpdatingSchool({ ...updatingSchool, classroomIds: e.target.value.split(',').map(id => id.trim()) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminIds">Admin IDs (comma-separated)</Label>
                <Input
                  id="adminIds"
                  value={updatingSchool.adminIds.join(', ')}
                  onChange={(e) => setUpdatingSchool({ ...updatingSchool, adminIds: e.target.value.split(',').map(id => id.trim()) })}
                  required
                />
              </div>
              <Button type="submit">Update School</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}