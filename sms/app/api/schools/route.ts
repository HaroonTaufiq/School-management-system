import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { z } from 'zod'
import { getToken } from 'next-auth/jwt'
import { verifyToken } from '@/lib/jwt'
import { School } from '@/models/School'
import { NextRequest } from 'next/server'
import { Student } from '@/models/Student'
import { schoolValidationSchema } from '@/models/School'
import { Classroom } from '@/models/Classroom'

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req })
    if (!token || !verifyToken(token.accessToken as string) || !token.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, location  } = schoolValidationSchema.parse(body)

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

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const payload = verifyToken(token)
    if (!payload || payload.role !== 'superadmin') {
      return NextResponse.json({ error: 'Access denied. You must be a superadmin to view this page.' }, { status: 401 })
    }
    
    await connectToDatabase()
    const schools = await School.find()
      .populate({
        path: 'classrooms',
        model: Classroom,
        populate: {
          path: 'students',
          model: Student
        }
      })
      .populate('admins')

    return NextResponse.json({ schools })
  } catch (error) {
    console.error('Error fetching schools:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'superadmin') {
      return NextResponse.json({ error: 'Access denied. You must be a superadmin to delete this school.' }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;
    await connectToDatabase();

    const existingSchool = await School.findOneAndDelete({ name });
    if (!existingSchool) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'School deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting school:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'superadmin') {
      return NextResponse.json({ error: 'Access denied. You must be a superadmin to update this school.' }, { status: 401 });
    }

    const body = await req.json();
    const { name, location } = schoolValidationSchema.parse(body);
    await connectToDatabase();

    const updatedSchool = await School.findOneAndUpdate({ name }, { location }, { new: true });
    if (!updatedSchool) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    return NextResponse.json({ school: updatedSchool, message: 'School updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating school:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}