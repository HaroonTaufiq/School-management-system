'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, UserPlus } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function AddAdminPage() {
  const { data: session, status } = useSession()
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    school: '',
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/user/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin),
      })
      if (!res.ok) throw new Error('Failed to create admin')
      setNewAdmin({ name: '', email: '', password: '', role: 'admin', school: '' })
      toast({
        title: "Success",
        description: "Admin created successfully",
      })
    } catch (error) {
      console.error('Failed to create admin:', error)
      toast({
        title: "Error",
        description: "Failed to create admin",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8" /></div>
  }

  if (!session || (session.user.role !== 'superadmin' && session.user.role !== 'admin')) {
    return <div className="text-center mt-8">Access denied. You don&apos;t have permission to view this page.</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Add New Administrator</h1>
      <Card>
        <CardHeader>
          <CardTitle>New Administrator Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newAdmin.name}
                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                required
              />
            </div>
            {session.user.role === 'superadmin' && (
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newAdmin.role}
                  onValueChange={(value) => setNewAdmin({ ...newAdmin, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superadmin">Superadmin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {(session.user.role === 'admin' || (session.user.role === 'superadmin' && newAdmin.role === 'admin')) && (
              <div className="space-y-2">
                <Label htmlFor="school">School</Label>
                <Input
                  id="school"
                  value={newAdmin.school}
                  onChange={(e) => setNewAdmin({ ...newAdmin, school: e.target.value })}
                  required
                />
              </div>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Create Administrator
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

