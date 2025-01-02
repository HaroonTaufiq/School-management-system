import { NextResponse } from 'next/server'
import { getToken } from "next-auth/jwt"
import { connectToDatabase } from '@/lib/mongodb'
import { User } from '@/models/User'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { NextRequest } from 'next/server'

const adminSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'superadmin']),
  school: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req })
    if (!token || (token.role !== 'superadmin' && token.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, email, password, role, school } = adminSchema.parse(body)

    // Additional authorization checks
    if (token.role === 'admin' && role === 'superadmin') {
      return NextResponse.json({ error: 'Admins cannot create superadmins' }, { status: 403 })
    }

    if (token.role === 'admin' && (!school || school !== token.school)) {
      return NextResponse.json({ error: 'Admins can only create admins for their own school' }, { status: 403 })
    }

    await connectToDatabase()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    const hashedPassword = await hash(password, 12)

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      school: role === 'admin' ? school : undefined,
    })

    await newUser.save()

    return NextResponse.json({ 
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
      message: 'Administrator created successfully' 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating admin:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

