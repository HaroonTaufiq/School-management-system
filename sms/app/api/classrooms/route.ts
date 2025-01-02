import { NextResponse, NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { z } from 'zod'
import { getToken } from 'next-auth/jwt'
import { verifyToken } from '@/lib/jwt'
import { Classroom } from '@/models/Classroom'
import { School } from '@/models/School'

const classroomSchema = z.object({
  name: z.string().min(1),
  vacancy: z.number().int().positive(),
  school: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
   
    const token = await getToken({ req })
    if (!token || !verifyToken(token.accessToken as string) || token.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, vacancy, school } = classroomSchema.parse(body)

    await connectToDatabase()

    const existingClassroom = await Classroom.findOne({ name, school })
    if (existingClassroom) {
      return NextResponse.json({ error: 'Classroom already exists in this school' }, { status: 400 })
    }

    const newClassroom = new Classroom({ name, vacancy, school })
    await newClassroom.save()

    await School.findByIdAndUpdate(school, { $push: { classrooms: newClassroom._id } })

    return NextResponse.json({ 
      classroom: newClassroom,
      message: 'Classroom created successfully' 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating classroom:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req })
    if (!token || !verifyToken(token.accessToken as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('token', token)
    await connectToDatabase()
    const classrooms = await Classroom.find(token.isAdmin ? {} : { school: token.school }).populate('students')

    return NextResponse.json({ classrooms })
  } catch (error) {
    console.error('Error fetching classrooms:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
