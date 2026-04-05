import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, x_handle, wallet_address } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    const password_hash = await bcrypt.hash(password, 12)
    const username = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '')

    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim()
    const role = adminEmail && normalizedEmail === adminEmail ? 'admin' : 'creator'

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        email: normalizedEmail,
        name: name.trim(),
        username,
        x_handle: x_handle?.trim() || null,
        wallet_address: wallet_address?.trim() || null,
        role,
        password_hash,
      })
      .select()
      .single()

    if (error) {
      console.error('Registration error:', error)
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    return NextResponse.json({ success: true, role: profile.role }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}