import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// PUT /api/payments/[payoutId] — mark as sent (admin only)
export async function PUT(req: Request, { params }: { params: { payoutId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
  }

  const body = await req.json()
  const { status, tx_hash, amount, notes } = body

  const { data: payment } = await supabaseAdmin
    .from('payments')
    .select('*, profiles(id, name, email)')
    .eq('id', params.payoutId)
    .single()

  if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

  const updates: Record<string, unknown> = {}
  if (status) updates.status = status
  if (tx_hash) updates.tx_hash = tx_hash?.trim()
  if (amount !== undefined) updates.amount = amount
  if (notes !== undefined) updates.notes = notes?.trim()
  if (status === 'sent') updates.sent_at = new Date().toISOString()

  const { data, error } = await supabaseAdmin
    .from('payments')
    .update(updates)
    .eq('id', params.payoutId)
    .select()
    .single()

  if (error) {
    console.error('Payments PUT error:', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  if (status === 'sent' && payment.profiles) {
    const creator = payment.profiles as { id: string; name: string }
    const amountStr = data.amount ? `${data.amount} ${data.currency}` : 'your payment'
    await supabaseAdmin.from('notifications').insert({
      user_id: creator.id,
      message: `Payment sent! ${amountStr} has been sent to you${tx_hash ? ` (TX: ${tx_hash.slice(0, 12)}...)` : ''}.`,
      type: 'payment_sent',
      metadata: { payment_id: params.payoutId, amount: data.amount, currency: data.currency, tx_hash },
    })
  }

  return NextResponse.json(data)
}
