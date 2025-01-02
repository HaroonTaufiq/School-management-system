import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { z } from 'zod'
import { getToken } from 'next-auth/jwt'
import { verifyToken } from '@/lib/jwt'
import { School } from '@/models/School'
import { NextRequest } from 'next/server'

const schoolSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req })
    console.log('post_api',token)
    // if (!token || !verifyToken(token.accessToken as string) || !token.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

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

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const payload = verifyToken(token)
    // console.log('payload:', payload?.role)
    if (!payload || payload.role !== 'superadmin') {
      return NextResponse.json({ error: 'Access denied. You must be a superadmin to view this page.' }, { status: 401 })
    }
    await connectToDatabase()
    const schools = await School.find().populate('classrooms').populate('admins')

    return NextResponse.json({ schools })
  } catch (error) {
    console.error('Error fetching schools:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

