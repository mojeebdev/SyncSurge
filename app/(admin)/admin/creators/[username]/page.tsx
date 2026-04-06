import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import CreatorDetailClient from '@/components/admin/CreatorDetailClient'

export default async function CreatorDetailPage({ params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const { data: creator, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      *,
      stream_entries ( id, scheduled_date, scheduled_time, status, proof_url, notes, created_at ),
      payments ( id, amount, status, currency, sent_at, tx_hash, notes, created_at )
    `)
    .eq('username', params.username)
    .eq('role', 'creator')
    .single()

  if (error || !creator) notFound()

  return <CreatorDetailClient creator={creator} />
}
