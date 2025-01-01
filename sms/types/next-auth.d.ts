import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      isAdmin?: boolean
      role: string
      school?: string | null
    }
    accessToken: string
  }

  interface User {
    id: string
    email: string
    role: string
    school?: string
    isAdmin?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    role: string
    school?: string
    isAdmin?: boolean
  }
}