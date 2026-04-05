import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function PUT(req: Request, { params }: { params: { alertId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('notifications')
    .update({ read: true })
    .eq('id', params.alertId)
    .eq('user_id', session.user.id)
    .select()
    .single()

  if (error) {
    console.error('Notifications PUT error:', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json(data)
}
