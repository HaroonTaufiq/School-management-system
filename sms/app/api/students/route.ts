import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { z } from 'zod'
import { verifyToken } from '@/lib/jwt'
import { Student } from '@/models/Student'
import { Classroom } from '@/models/Classroom'
import { studentValidationSchema } from '@/models/Student'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const payload = verifyToken(token)
    if (!payload || payload.role !== 'superadmin' || !payload.isAdmin) {
      return NextResponse.json({ error: 'Access denied. You must be an admin to create students.' }, { status: 401 })
    }

    const body = await req.json()
    const { username, classroom } = studentValidationSchema.parse(body)

    await connectToDatabase()

    const existingStudent = await Student.findOne({ username })
    if (existingStudent) {
      return NextResponse.json({ error: 'Student already exists' }, { status: 400 })
    }

    const existingClassroom = await Classroom.findOne({ 
      _id: classroom, 
      school: payload.school 
    })
    if (!existingClassroom) {
      return NextResponse.json({ error: 'Classroom does not exist in this school' }, { status: 400 })
    }

    const newStudent = new Student({ username, classroom })
    await newStudent.save()

    await Classroom.findByIdAndUpdate(existingClassroom._id, { 
      $push: { students: newStudent._id } 
    })

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

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    console.log('authhead', authHeader)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    // If superadmin, can see all students
    // If admin, can only see students from their school
    const query = payload.role === 'superadmin' 
      ? {}
      : { 'classroom': { $in: await Classroom.find({ school: payload.school }).distinct('_id') } }
    
    const students = await Student.find(query)
      .populate({
        path: 'classroom',
        populate: {
          path: 'school'
        }
      })

    return NextResponse.json({ students })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const payload = verifyToken(token)
    if (!payload || payload.role !== 'superadmin') {
      return NextResponse.json({ error: 'Access denied. You must be an admin to update students.' }, { status: 401 })
    }

    const body = await req.json()
    const { username, classroom } = studentValidationSchema.parse(body)
    await connectToDatabase()

    // Verify the student exists and belongs to admin's school
    const existingStudent = await Student.findById(body._id).populate('classroom')
    if (!existingStudent || existingStudent.classroom.school.toString() !== payload.school) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Verify the new classroom exists and belongs to admin's school
    const newClassroom = await Classroom.findOne({ 
      _id: classroom, 
      school: payload.school 
    })
    if (!newClassroom) {
      return NextResponse.json({ error: 'Classroom not found in your school' }, { status: 404 })
    }

    existingStudent.username = username
    existingStudent.classroom = classroom
    await existingStudent.save()

    return NextResponse.json({ 
      student: existingStudent, 
      message: 'Student updated successfully' 
    }, { status: 200 })
  } catch (error) {
    console.error('Error updating student:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. You must be an admin to delete students.' }, { status: 401 })
    }

    const body = await req.json()
    const { _id } = body
    await connectToDatabase()

    // Verify the student exists and belongs to admin's school
    const existingStudent = await Student.findById(_id).populate('classroom')
    if (!existingStudent || existingStudent.classroom.school.toString() !== payload.school) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Remove student from classroom
    await Classroom.findByIdAndUpdate(existingStudent.classroom, {
      $pull: { students: existingStudent._id }
    })

    await Student.findByIdAndDelete(_id)

    return NextResponse.json({ 
      message: 'Student deleted successfully' 
    }, { status: 200 })
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}