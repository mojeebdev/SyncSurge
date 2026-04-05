import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from './supabase'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const { data: profile, error } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('email', credentials.email.toLowerCase().trim())
          .single()

        if (error || !profile) {
          throw new Error('Invalid email or password')
        }

        const isValid = await bcrypt.compare(credentials.password, profile.password_hash)
        if (!isValid) {
          throw new Error('Invalid email or password')
        }

        return {
          id: profile.id,
          email: profile.email,
          name: profile.name || profile.email.split('@')[0],
          role: profile.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role as 'creator' | 'admin'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as 'creator' | 'admin'
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}
