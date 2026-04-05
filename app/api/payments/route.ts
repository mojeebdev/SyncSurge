import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/payments
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const creatorId = url.searchParams.get('creator_id')

  let query = supabaseAdmin
    .from('payments')
    .select('*, profiles(name, email, x_handle, wallet_address), stream_entries(scheduled_date, scheduled_time, proof_url)')
    .order('created_at', { ascending: false })

  if (session.user.role !== 'admin') {
    query = query.eq('creator_id', session.user.id)
  } else if (creatorId) {
    query = query.eq('creator_id', creatorId)
  }

  const { data, error } = await query
  if (error) {
    console.error('Payments GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/payments — create payment (admin only)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
  }

  const body = await req.json()
  const { creator_id, stream_entry_id, amount, currency, notes } = body

  if (!creator_id) {
    return NextResponse.json({ error: 'creator_id is required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('payments')
    .insert({
      creator_id,
      stream_entry_id: stream_entry_id || null,
      amount: amount || null,
      currency: currency || 'USD',
      status: 'pending',
      notes: notes?.trim() || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Payments POST error:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
