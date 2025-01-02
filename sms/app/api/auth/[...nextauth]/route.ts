
import NextAuth from "next-auth"
import type { User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { AuthOptions } from "next-auth"
import { connectToDatabase } from "@/lib/mongodb"
import { generateToken } from "@/lib/jwt"
import { JWT } from "next-auth/jwt"
import { Session } from "next-auth"
import { User as UserModel } from "@/models/User"

// Define custom session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      role: string
      school?: string
      name?: string | null
      image?: string | null
    }
    expires: string
    accessToken: string
  }

  interface User {
    id: string
    email: string
    role: string
    school?: string
  }
}

// Define custom JWT type
declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    role: string
    school?: string
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        await connectToDatabase()
        const user = await UserModel.findOne({ email: credentials.email })

        if (!user || !(await compare(credentials.password, user.password))) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          school: user.school,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.role = user.role
        token.school = user.school
      }
      return token
    },
    async session({ session, token }: { session: Session, token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.role = token.role as string
        session.user.school = token.school as string | undefined
        session.accessToken = generateToken(token)
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }