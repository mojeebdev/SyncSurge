import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import AdminPaymentsClient from '@/components/admin/AdminPaymentsClient'

export default async function AdminPaymentsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const { data: payments } = await supabaseAdmin
    .from('payments')
    .select('*, profiles(name, email, username, wallet_address), stream_entries(scheduled_date)')
    .order('created_at', { ascending: false })

  return <AdminPaymentsClient payments={payments || []} />
}
