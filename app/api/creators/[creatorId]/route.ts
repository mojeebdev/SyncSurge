import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/creators/[creatorId]
export async function GET(req: Request, { params }: { params: { creatorId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = session.user.role === 'admin'

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', params.creatorId)
    .single()

  if (error || !profile) return NextResponse.json({ error: 'Creator not found' }, { status: 404 })

  if (!isAdmin && profile.id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(profile)
}

// PUT /api/creators/[creatorId] — update profile
export async function PUT(req: Request, { params }: { params: { creatorId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, x_handle, wallet_address } = body

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', params.creatorId)
    .single()

  if (!profile) return NextResponse.json({ error: 'Creator not found' }, { status: 404 })

  if (session.user.role !== 'admin' && profile.id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({
      name: name?.trim() || undefined,
      x_handle: x_handle?.trim() || null,
      wallet_address: wallet_address?.trim() || null,
    })
    .eq('id', params.creatorId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  return NextResponse.json(data)
}
