'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { parseISO, isToday } from 'date-fns'
import {
  ArrowLeft, Twitter, Wallet, Mail, Calendar, DollarSign,
  ExternalLink, CheckCircle, Clock, XCircle, Plus, Loader2, Send
} from 'lucide-react'
import Header from '@/components/layout/Header'
import AccountabilityCalendar from '@/components/creator/AccountabilityCalendar'
import PaymentModal from '@/components/admin/PaymentModal'
import { Profile, StreamEntry, Payment } from '@/types'
import { formatTime, formatDate, truncateAddress, getPaymentStatusColor } from '@/lib/utils'

export default function CreatorDetailPage() {
  const { username } = useParams<{ username: string }>()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [entries, setEntries] = useState<StreamEntry[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentModal, setPaymentModal] = useState<string | null>(null)
  const [creatingPayment, setCreatingPayment] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const profileRes = await fetch(`/api/creators/${username}`)
      if (!profileRes.ok) return
      const profileData: Profile = await profileRes.json()
      setProfile(profileData)

      const [streamsRes, paymentsRes] = await Promise.all([
        fetch(`/api/streams?creator_id=${profileData.id}`),
        fetch(`/api/payments?creator_id=${profileData.id}`),
      ])
      if (streamsRes.ok) setEntries(await streamsRes.json())
      if (paymentsRes.ok) setPayments(await paymentsRes.json())
    } finally {
      setLoading(false)
    }
  }, [username])

  useEffect(() => { fetchData() }, [fetchData])

  async function createPayment() {
    if (!profile) return
    setCreatingPayment(true)
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creator_id: profile.id }),
      })
      if (!res.ok) {
        toast.error('Failed to create payment')
        return
      }
      const data = await res.json()
      toast.success('Payment record created')
      fetchData()
      setPaymentModal(data.id)
    } finally {
      setCreatingPayment(false)
    }
  }

  const todayEntry = entries.find((e) => isToday(parseISO(e.scheduled_date)))

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent-purple" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-400">Creator not found</p>
          <Link href="/admin" className="text-accent-purple-light hover:underline text-sm mt-2 inline-block">
            Back to admin
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          All Creators
        </Link>

        {/* Profile header */}
        <div className="bg-bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {(profile.name || profile.email)[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold">{profile.name || 'Unnamed Creator'}</h1>
              {profile.username && (
                <p className="text-sm text-accent-purple-light font-mono mt-0.5">@{profile.username}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-2">
                <span className="flex items-center gap-1.5 text-sm text-gray-400">
                  <Mail className="w-3.5 h-3.5" />
                  {profile.email}
                </span>
                {profile.x_handle && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-400">
                    <Twitter className="w-3.5 h-3.5" />
                    {profile.x_handle}
                  </span>
                )}
                {profile.wallet_address && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-400 font-mono">
                    <Wallet className="w-3.5 h-3.5" />
                    {truncateAddress(profile.wallet_address, 6)}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-2">Joined {formatDate(profile.created_at)}</p>
            </div>

            {/* Today status */}
            <div className="flex-shrink-0 text-right">
              <p className="text-xs text-gray-500 mb-1">Today</p>
              {todayEntry ? (
                <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${
                  todayEntry.status === 'completed' ? 'bg-green-400/10 text-green-400' :
                  todayEntry.status === 'scheduled' ? 'bg-cyan-400/10 text-cyan-400' :
                  'bg-red-400/10 text-red-400'
                }`}>
                  {todayEntry.status === 'completed' && <CheckCircle className="w-3.5 h-3.5" />}
                  {todayEntry.status === 'scheduled' && <Clock className="w-3.5 h-3.5" />}
                  {todayEntry.status === 'missed' && <XCircle className="w-3.5 h-3.5" />}
                  {todayEntry.status}
                </span>
              ) : (
                <span className="text-xs text-gray-600 bg-bg-secondary px-3 py-1.5 rounded-full">
                  No entry
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <div>
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent-purple-light" />
              Stream History
            </h2>
            <AccountabilityCalendar entries={entries} />

            {entries.length > 0 && (
              <div className="mt-4 space-y-2">
                {entries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="bg-bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{formatDate(entry.scheduled_date)}</p>
                      <p className="text-xs text-gray-500">{formatTime(entry.scheduled_time)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.proof_url && (
                        <a
                          href={entry.proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-accent-cyan hover:text-accent-cyan-light flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Proof
                        </a>
                      )}
                      <span className={`text-xs px-2.5 py-1 rounded-full ${
                        entry.status === 'completed' ? 'bg-green-400/10 text-green-400' :
                        entry.status === 'scheduled' ? 'bg-cyan-400/10 text-cyan-400' :
                        'bg-red-400/10 text-red-400'
                      }`}>
                        {entry.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payments */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-accent-purple-light" />
                Payments
              </h2>
              <button
                onClick={createPayment}
                disabled={creatingPayment}
                className="flex items-center gap-1.5 text-xs bg-accent-purple hover:bg-accent-purple-light disabled:opacity-50 text-white px-3 py-2 rounded-lg transition-colors font-medium"
              >
                {creatingPayment ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                New Payment
              </button>
            </div>

            {payments.length === 0 ? (
              <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-sm text-gray-500">No payments yet</p>
                <p className="text-xs text-gray-600 mt-1">Create a payment record to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div key={payment.id} className="bg-bg-card border border-border rounded-xl px-4 py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {payment.amount ? `${payment.amount} ${payment.currency}` : 'Amount TBD'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatDate(payment.created_at)}</p>
                        {payment.tx_hash && (
                          <p className="text-xs text-gray-600 font-mono mt-1">
                            TX: {payment.tx_hash.slice(0, 16)}...
                          </p>
                        )}
                        {payment.notes && (
                          <p className="text-xs text-gray-500 mt-1">{payment.notes}</p>
                        )}
                        {payment.stream_entries && (
                          <p className="text-xs text-gray-600 mt-1">
                            Stream: {formatDate(payment.stream_entries.scheduled_date)}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getPaymentStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                        {payment.status === 'pending' && (
                          <button
                            onClick={() => setPaymentModal(payment.id)}
                            className="flex items-center gap-1.5 text-xs text-accent-purple-light hover:text-white transition-colors border border-accent-purple/30 hover:border-accent-purple px-2.5 py-1.5 rounded-lg"
                          >
                            <Send className="w-3 h-3" />
                            Mark Sent
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {paymentModal && paymentModal !== 'new' && (
        <PaymentModal
          paymentId={paymentModal}
          creatorName={profile.name || profile.email}
          currentAmount={payments.find((p) => p.id === paymentModal)?.amount}
          currency={payments.find((p) => p.id === paymentModal)?.currency}
          onClose={() => setPaymentModal(null)}
          onSuccess={fetchData}
        />
      )}
    </div>
  )
}