import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const { data: creators } = await supabaseAdmin
    .from('profiles')
    .select(`
      *,
      stream_entries ( id, scheduled_date, scheduled_time, status, proof_url, notes ),
      payments ( id, amount, status, currency, sent_at, tx_hash, notes, created_at )
    `)
    .eq('role', 'creator')
    .order('created_at', { ascending: false })

  const { data: allPayments } = await supabaseAdmin
    .from('payments')
    .select('id, amount, status, currency')

  const totalPaid = allPayments
    ?.filter((p) => p.status === 'sent')
    .reduce((sum, p) => sum + (p.amount || 0), 0) || 0

  const pendingPayments = allPayments?.filter((p) => p.status === 'pending').length || 0

  const stats = {
    totalCreators: creators?.length || 0,
    pendingPayments,
    totalPaid,
  }

  return <AdminDashboardClient creators={creators || []} stats={stats} />
}
