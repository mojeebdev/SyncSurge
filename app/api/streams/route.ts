import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/streams
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const creatorId = url.searchParams.get('creator_id')
  const month = url.searchParams.get('month')

  let query = supabaseAdmin
    .from('stream_entries')
    .select('*, profiles(name, email, x_handle)')
    .order('scheduled_date', { ascending: false })

  if (session.user.role !== 'admin') {
    query = query.eq('creator_id', session.user.id)
  } else if (creatorId) {
    query = query.eq('creator_id', creatorId)
  }

  if (month) {
    const start = `${month}-01`
    const [year, mon] = month.split('-').map(Number)
    const end = new Date(year, mon, 0).toISOString().split('T')[0]
    query = query.gte('scheduled_date', start).lte('scheduled_date', end)
  }

  const { data, error } = await query
  if (error) {
    console.error('Streams GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch streams' }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/streams
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { scheduled_date, scheduled_time, proof_url, notes } = body

  if (!scheduled_date || !scheduled_time) {
    return NextResponse.json({ error: 'Date and time are required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('stream_entries')
    .upsert(
      {
        creator_id: session.user.id,
        scheduled_date,
        scheduled_time,
        status: proof_url ? 'completed' : 'scheduled',
        proof_url: proof_url?.trim() || null,
        notes: notes?.trim() || null,
      },
      { onConflict: 'creator_id,scheduled_date' }
    )
    .select()
    .single()

  if (error) {
    console.error('Streams POST error:', error)
    return NextResponse.json({ error: 'Failed to save stream entry' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
