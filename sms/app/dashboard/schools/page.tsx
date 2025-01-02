'use client'

import { useState, useEffect } from 'react'
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
  classrooms: string[];
}

export default function SchoolsPage() {
  const { data: session, status } = useSession()
  const [schools, setSchools] = useState([])
  const [newSchool, setNewSchool] = useState({ name: '', location: '' })
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()

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
      toast({
        title: "Error",
        description: "Failed to fetch schools",
        variant: "destructive",
      })
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

  if (!session?.user.isAdmin) {
    return <div>Access denied. You must be a superadmin to view this page.</div>
  }

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
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((school: School) => (
                  <TableRow key={school._id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell>{school.location}</TableCell>
                    <TableCell>{school.classrooms?.length || 0}</TableCell>
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
            <Button type="submit" disabled={creating}>
              {creating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <School className="mr-2 h-4 w-4" />}
              Create School
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

