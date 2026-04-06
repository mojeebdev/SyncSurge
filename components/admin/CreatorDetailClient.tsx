'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Twitter, Wallet, Mail, CheckCircle, Clock,
  XCircle, DollarSign, Send, ExternalLink, Plus
} from 'lucide-react'
import { Profile, StreamEntry, Payment } from '@/types'
import { truncateAddress } from '@/lib/utils'

interface CreatorWithData extends Profile {
  stream_entries: StreamEntry[]
  payments: Payment[]
}

export default function CreatorDetailClient({ creator: initial }: { creator: CreatorWithData }) {
  const [creator, setCreator] = useState(initial)
  const [sending, setSending] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentForm, setPaymentForm] = useState({ amount: '', currency: 'USDC', notes: '', tx_hash: '' })

  async function markAsSent(paymentId: string, txHash?: string) {
    setSending(paymentId)
    try {
      const res = await fetch(`/api/payments/${paymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'sent', tx_hash: txHash }),
      })
      if (!res.ok) { toast.error('Failed to update payment'); return }
      toast.success('Payment marked as sent!')
      setCreator((prev) => ({
        ...prev,
        payments: prev.payments.map((p) =>
          p.id === paymentId ? { ...p, status: 'sent' as const, tx_hash: txHash || null, sent_at: new Date().toISOString() } : p
        ),
      }))
    } finally {
      setSending(null)
    }
  }

  async function createPayment() {
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_id: creator.id,
          amount: parseFloat(paymentForm.amount) || null,
          currency: paymentForm.currency,
          notes: paymentForm.notes,
        }),
      })
      if (!res.ok) { toast.error('Failed to create payment'); return }
      const newPayment = await res.json()
      toast.success('Payment created!')
      setCreator((prev) => ({ ...prev, payments: [newPayment, ...prev.payments] }))
      setShowPaymentModal(false)
      setPaymentForm({ amount: '', currency: 'USDC', notes: '', tx_hash: '' })
    } catch {
      toast.error('Something went wrong')
    }
  }

  const pendingPayments = creator.payments.filter((p) => p.status === 'pending')
  const sentPayments = creator.payments.filter((p) => p.status === 'sent')

  return (
    <div className="min-h-screen bg-bg-primary p-8 max-w-5xl mx-auto">
      {/* Back */}
      <Link href="/admin/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Profile header */}
      <div className="bg-bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {(creator.name || creator.email)[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{creator.name || 'Unnamed'}</h1>
            <p className="text-gray-400 text-sm">@{creator.username}</p>
            <div className="flex flex-wrap gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                <Mail className="w-3.5 h-3.5" /> {creator.email}
              </div>
              {creator.x_handle && (
                <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                  <Twitter className="w-3.5 h-3.5" /> {creator.x_handle}
                </div>
              )}
              {creator.wallet_address && (
                <div className="flex items-center gap-1.5 text-gray-400 text-xs font-mono">
                  <Wallet className="w-3.5 h-3.5" /> {truncateAddress(creator.wallet_address)}
                </div>
              )}
            </div>
          </div>
          <div className="text-right text-xs text-gray-500">
            Joined {format(parseISO(creator.created_at), 'MMM d, yyyy')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stream entries */}
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold">Stream History</h2>
            <p className="text-xs text-gray-500 mt-0.5">{creator.stream_entries.length} total sessions</p>
          </div>
          <div className="divide-y divide-border/50 max-h-80 overflow-y-auto">
            {creator.stream_entries.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No streams yet</div>
            ) : (
              creator.stream_entries.map((entry) => (
                <div key={entry.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm">{format(parseISO(entry.scheduled_date), 'MMM d, yyyy')}</p>
                    <p className="text-xs text-gray-500">{entry.scheduled_time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.status === 'completed' && (
                      <span className="flex items-center gap-1 text-green-400 text-xs bg-green-400/10 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Done
                      </span>
                    )}
                    {entry.status === 'scheduled' && (
                      <span className="flex items-center gap-1 text-cyan-400 text-xs bg-cyan-400/10 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> Scheduled
                      </span>
                    )}
                    {entry.status === 'missed' && (
                      <span className="flex items-center gap-1 text-red-400 text-xs bg-red-400/10 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3" /> Missed
                      </span>
                    )}
                    {entry.proof_url && (
                      <a href={entry.proof_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payments */}
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Payments</h2>
              <p className="text-xs text-gray-500 mt-0.5">{pendingPayments.length} pending · {sentPayments.length} sent</p>
            </div>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-1.5 text-xs bg-accent-purple hover:bg-accent-purple-light text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>
          <div className="divide-y divide-border/50 max-h-80 overflow-y-auto">
            {creator.payments.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No payments yet</div>
            ) : (
              creator.payments.map((payment) => (
                <div key={payment.id} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-gray-500" />
                      <span className="font-medium text-sm">
                        {payment.amount ? `${payment.amount} ${payment.currency}` : payment.currency}
                      </span>
                    </div>
                    {payment.status === 'pending' ? (
                      <button
                        onClick={() => {
                          const tx = prompt('Enter TX hash (optional):') || undefined
                          markAsSent(payment.id, tx)
                        }}
                        disabled={sending === payment.id}
                        className="flex items-center gap-1 text-xs bg-green-400/10 text-green-400 hover:bg-green-400/20 px-2.5 py-1 rounded-full transition-colors disabled:opacity-50"
                      >
                        <Send className="w-3 h-3" />
                        {sending === payment.id ? 'Sending...' : 'Mark Sent'}
                      </button>
                    ) : (
                      <span className="text-xs text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full">Sent</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{format(parseISO(payment.created_at), 'MMM d, yyyy')}</span>
                    {payment.tx_hash && (
                      <span className="font-mono">{payment.tx_hash.slice(0, 12)}...</span>
                    )}
                  </div>
                  {payment.notes && <p className="text-xs text-gray-500 mt-1">{payment.notes}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Payment modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-lg mb-4">Create Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Amount</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Currency</label>
                <select
                  value={paymentForm.currency}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, currency: e.target.value }))}
                  className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-purple"
                >
                  <option>USDC</option>
                  <option>ETH</option>
                  <option>SOL</option>
                  <option>USD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Notes (optional)</label>
                <input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="e.g. Week 1 payout"
                  className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 border border-border rounded-xl py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createPayment}
                className="flex-1 bg-accent-purple hover:bg-accent-purple-light text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
              >
                Create Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
