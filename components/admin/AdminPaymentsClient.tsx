'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { ArrowLeft, Send, CheckCircle, Clock, ExternalLink } from 'lucide-react'
import { Payment } from '@/types'

interface PaymentWithRelations extends Omit<Payment, 'profiles'> {
  profiles: { name: string; email: string; username: string | null; wallet_address: string | null } | null
}

export default function AdminPaymentsClient({ payments: initial }: { payments: PaymentWithRelations[] }) {
  const [payments, setPayments] = useState(initial)
  const [sending, setSending] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent'>('all')

  const filtered = filter === 'all' ? payments : payments.filter((p) => p.status === filter)

  async function markAsSent(paymentId: string) {
    const tx = prompt('Enter TX hash (optional):') || undefined
    setSending(paymentId)
    try {
      const res = await fetch(`/api/payments/${paymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'sent', tx_hash: tx }),
      })
      if (!res.ok) { toast.error('Failed to update payment'); return }
      toast.success('Payment marked as sent!')
      setPayments((prev) =>
        prev.map((p) => p.id === paymentId ? { ...p, status: 'sent' as const, tx_hash: tx || null, sent_at: new Date().toISOString() } : p)
      )
    } finally {
      setSending(null)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary p-8 max-w-5xl mx-auto">
      <Link href="/admin/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-gray-400 mt-1">{payments.filter(p => p.status === 'pending').length} pending</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'sent'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                filter === f ? 'bg-accent-purple text-white' : 'bg-bg-card border border-border text-gray-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-gray-500 text-xs uppercase tracking-wide">
                <th className="text-left px-5 py-3.5 font-medium">Creator</th>
                <th className="text-left px-4 py-3.5 font-medium">Amount</th>
                <th className="text-left px-4 py-3.5 font-medium">Status</th>
                <th className="text-left px-4 py-3.5 font-medium hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3.5 font-medium hidden lg:table-cell">TX</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-500">No payments found</td></tr>
              ) : filtered.map((payment) => (
                <tr key={payment.id} className="border-b border-border/50 last:border-0 hover:bg-bg-secondary/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-white">{payment.profiles?.name || 'Unknown'}</p>
                    <p className="text-gray-500 text-xs">{payment.profiles?.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-medium">{payment.amount ? `${payment.amount} ${payment.currency}` : payment.currency}</span>
                  </td>
                  <td className="px-4 py-4">
                    {payment.status === 'pending' ? (
                      <span className="flex items-center gap-1 text-yellow-400 text-xs bg-yellow-400/10 px-2.5 py-1 rounded-full w-fit">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-400 text-xs bg-green-400/10 px-2.5 py-1 rounded-full w-fit">
                        <CheckCircle className="w-3 h-3" /> Sent
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell text-gray-500 text-xs">
                    {format(parseISO(payment.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    {payment.tx_hash ? (
                      <span className="font-mono text-xs text-gray-400">{payment.tx_hash.slice(0, 12)}...</span>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {payment.status === 'pending' ? (
                      <button
                        onClick={() => markAsSent(payment.id)}
                        disabled={sending === payment.id}
                        className="flex items-center gap-1 text-xs bg-green-400/10 text-green-400 hover:bg-green-400/20 px-2.5 py-1 rounded-full transition-colors disabled:opacity-50"
                      >
                        <Send className="w-3 h-3" />
                        {sending === payment.id ? 'Sending...' : 'Mark Sent'}
                      </button>
                    ) : payment.profiles?.username ? (
                      <Link
                        href={`/admin/creators/${payment.profiles.username}`}
                        className="text-xs text-accent-purple-light hover:text-white transition-colors flex items-center gap-1"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
