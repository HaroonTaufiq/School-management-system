import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based access control
  if (request.nextUrl.pathname.startsWith('/dashboard/schools') && !token.isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if ((request.nextUrl.pathname.startsWith('/dashboard/classrooms') || 
       request.nextUrl.pathname.startsWith('/dashboard/students')) && 
      token.isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}

