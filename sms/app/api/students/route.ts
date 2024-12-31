import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { z } from 'zod'
import { getToken } from 'next-auth/jwt'
import { verifyToken } from '@/lib/jwt'
import { Student } from '@/models/Student'
import { Classroom } from '@/models/Classroom'

const studentSchema = z.object({
  username: z.string().min(3),
  classroom: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const token = await getToken({ req })
    if (!token || !verifyToken(token.accessToken as string) || token.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { username, classroom } = studentSchema.parse(body)

    await connectToDatabase()

    const existingStudent = await Student.findOne({ username })
    if (existingStudent) {
      return NextResponse.json({ error: 'Student already exists' }, { status: 400 })
    }

    const existingClassroom = await Classroom.findOne({ name: classroom, school: token.school })
    if (!existingClassroom) {
      return NextResponse.json({ error: 'Classroom does not exist in this school' }, { status: 400 })
    }

    const newStudent = new Student({ username, classroom })
    await newStudent.save()

    await Classroom.findByIdAndUpdate(existingClassroom._id, { $push: { students: newStudent._id } })

    return NextResponse.json({ 
      student: newStudent,
      message: 'Student created successfully' 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating student:', error)
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
    const students = await Student.find()

    return NextResponse.json({ students })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

