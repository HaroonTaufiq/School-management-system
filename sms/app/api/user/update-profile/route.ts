import { NextResponse } from 'next/server'
import { getToken } from "next-auth/jwt"
import { connectToDatabase } from '@/lib/mongodb'
import { User } from '@/models/User'
import { z } from 'zod'
import { NextRequest } from 'next/server'

const profileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req })
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, email } = profileSchema.parse(body)

    await connectToDatabase()

    const updatedUser = await User.findByIdAndUpdate(
      token.id,
      { name, email },
      { new: true, runValidators: true }
    )

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      user: { id: updatedUser._id, name: updatedUser.name, email: updatedUser.email },
      message: 'Profile updated successfully' 
    }, { status: 200 })
  } catch (error) {
    console.error('Error updating profile:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

