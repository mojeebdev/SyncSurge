import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// PUT /api/streams/[sessionId]
export async function PUT(req: Request, { params }: { params: { sessionId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { status, proof_url, notes, scheduled_time } = body

  const { data: entry } = await supabaseAdmin
    .from('stream_entries')
    .select('*, profiles(id)')
    .eq('id', params.sessionId)
    .single()

  if (!entry) return NextResponse.json({ error: 'Stream entry not found' }, { status: 404 })

  const isOwner = (entry.profiles as { id: string })?.id === session.user.id
  const isAdmin = session.user.role === 'admin'

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updates: Record<string, unknown> = {}
  if (status) updates.status = status
  if (proof_url !== undefined) updates.proof_url = proof_url?.trim() || null
  if (notes !== undefined) updates.notes = notes?.trim() || null
  if (scheduled_time) updates.scheduled_time = scheduled_time

  const { data, error } = await supabaseAdmin
    .from('stream_entries')
    .update(updates)
    .eq('id', params.sessionId)
    .select()
    .single()

  if (error) {
    console.error('Streams PUT error:', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE /api/streams/[sessionId]
export async function DELETE(req: Request, { params }: { params: { sessionId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: entry } = await supabaseAdmin
    .from('stream_entries')
    .select('*, profiles(id)')
    .eq('id', params.sessionId)
    .single()

  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isOwner = (entry.profiles as { id: string })?.id === session.user.id
  if (!isOwner && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabaseAdmin.from('stream_entries').delete().eq('id', params.sessionId)
  if (error) {
    console.error('Streams DELETE error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
