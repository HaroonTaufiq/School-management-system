import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDatabase } from "./mongodb"
import { compare } from "bcryptjs"
import { generateToken } from "./jwt"

export const authOptions: NextAuthOptions = {
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

        const { db } = await connectToDatabase()
        const user = await db.collection("users").findOne({ email: credentials.email })

        if (!user || !(await compare(credentials.password, user.password))) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user._id.toString(),
          email: user.email,
          isAdmin: user.isAdmin,
          school: user.school,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.isAdmin = user.isAdmin
        token.school = user.school
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.email = token.email
      session.user.isAdmin = token.isAdmin
      session.user.school = token.school
      session.accessToken = generateToken(token)
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

