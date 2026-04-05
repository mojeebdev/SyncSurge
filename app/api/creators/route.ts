import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _req: Request,
  { params }: { params: { username: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      *,
      stream_entries (
        id, scheduled_date, scheduled_time, status, proof_url
      ),
      payments (
        id, amount, status, currency, sent_at, tx_hash, notes, created_at,
        stream_entries ( scheduled_date )
      )
    `)
    .eq('username', params.username)
    .eq('role', 'creator')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}