import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { z } from 'zod'
import { getToken } from 'next-auth/jwt'
import { verifyToken } from '@/lib/jwt'
import { School } from '@/models/School'

const schoolSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const token = await getToken({ req })
    if (!token || !verifyToken(token.accessToken as string) || !token.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, location } = schoolSchema.parse(body)

    await connectToDatabase()

    const existingSchool = await School.findOne({ name })
    if (existingSchool) {
      return NextResponse.json({ error: 'School already exists' }, { status: 400 })
    }

    const newSchool = new School({ name, location })
    await newSchool.save()

    return NextResponse.json({ 
      school: newSchool,
      message: 'School created successfully' 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating school:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const token = await getToken({ req })
    if (!token || !verifyToken(token.accessToken as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    const schools = await School.find().populate('classrooms').populate('admins')

    return NextResponse.json({ schools })
  } catch (error) {
    console.error('Error fetching schools:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

