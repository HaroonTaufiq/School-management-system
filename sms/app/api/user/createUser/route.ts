import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { hash } from 'bcryptjs'
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  isAdmin: z.boolean().optional(),
  school: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, username, password, isAdmin, school } = userSchema.parse(body)

    const { db } = await connectToDatabase()

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // If not admin, school is required
    if (!isAdmin && !school) {
      return NextResponse.json({ error: 'School is required for non-admin users' }, { status: 400 })
    }

    // If school is provided, check if it exists
    if (school) {
      const existingSchool = await db.collection('schools').findOne({ name: school })
      if (!existingSchool) {
        return NextResponse.json({ error: 'School does not exist' }, { status: 400 })
      }
    }

    const hashedPassword = await hash(password, 12)

    const newUser = {
      email,
      username,
      password: hashedPassword,
      isAdmin: isAdmin || false,
      school: school || null,
    }

    const result = await db.collection('users').insertOne(newUser)

    return NextResponse.json({ 
      user: { ...newUser, password: undefined },
      message: 'User created successfully' 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

