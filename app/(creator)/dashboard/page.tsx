'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { format, isToday, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { Clock, Link as LinkIcon, Send, CheckCircle, TrendingUp, Calendar, DollarSign, Loader2 } from 'lucide-react'
import Header from '@/components/layout/Header'
import AccountabilityCalendar from '@/components/creator/AccountabilityCalendar'
import { StreamEntry, Payment } from '@/types'
import { formatTime, formatDate, getPaymentStatusColor } from '@/lib/utils'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [entries, setEntries] = useState<StreamEntry[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const [form, setForm] = useState({
    scheduled_time: '18:00',
    proof_url: '',
    notes: '',
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [entriesRes, paymentsRes] = await Promise.all([
        fetch('/api/streams'),
        fetch('/api/payments'),
      ])
      if (entriesRes.ok) setEntries(await entriesRes.json())
      if (paymentsRes.ok) setPayments(await paymentsRes.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const todayEntry = entries.find((e) => isToday(parseISO(e.scheduled_date)))
  const streakCount = entries.filter((e) => e.status === 'completed').length
  const pendingPayments = payments.filter((p) => p.status === 'pending').length

  async function handleLogStream(e: React.FormEvent) {
    e.preventDefault()
    if (!form.scheduled_time) {
      toast.error('Please set a stream time')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
          scheduled_time: form.scheduled_time,
          proof_url: form.proof_url,
          notes: form.notes,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to log stream')
        return
      }
      toast.success(isToday(selectedDate) ? 'Stream logged for today!' : `Stream logged for ${format(selectedDate, 'MMM d')}`)
      setForm({ scheduled_time: '18:00', proof_url: '', notes: '' })
      fetchData()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedEntry = entries.find(
    (e) => e.scheduled_date === format(selectedDate, 'yyyy-MM-dd')
  )

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            {session?.user?.name?.split(' ')[0] || 'Creator'} 👋
          </h1>
          <p className="text-gray-400 mt-1">
            {isToday(selectedDate)
              ? todayEntry
                ? `You've logged your stream for today${todayEntry.status === 'completed' ? ' ✓' : ' — waiting for payment'}`
                : "You haven't logged today's stream yet."
              : `Viewing ${format(selectedDate, 'MMM d, yyyy')}`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Completed Streams', value: streakCount, icon: CheckCircle, color: 'text-green-400' },
            { label: 'Pending Payments', value: pendingPayments, icon: DollarSign, color: 'text-yellow-400' },
            { label: 'Total Logged', value: entries.length, icon: Calendar, color: 'text-cyan-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <div>
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent-purple-light" />
              Accountability Calendar
            </h2>
            <AccountabilityCalendar
              entries={entries}
              onDayClick={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>

          {/* Log stream form */}
          <div>
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent-purple-light" />
              {selectedEntry ? 'Update Entry' : 'Log Stream'} — {format(selectedDate, 'MMM d, yyyy')}
            </h2>

            <div className="bg-bg-card border border-border rounded-xl p-6">
              {selectedEntry && (
                <div className={`mb-5 p-3 rounded-lg flex items-center gap-2 text-sm ${
                  selectedEntry.status === 'completed' ? 'bg-green-400/10 text-green-400' :
                  selectedEntry.status === 'scheduled' ? 'bg-cyan-400/10 text-cyan-400' :
                  'bg-red-400/10 text-red-400'
                }`}>
                  <CheckCircle className="w-4 h-4" />
                  Entry exists: {selectedEntry.status} at {formatTime(selectedEntry.scheduled_time)}
                </div>
              )}

              <form onSubmit={handleLogStream} className="space-y-4">
                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stream time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="time"
                      value={form.scheduled_time}
                      onChange={(e) => setForm((p) => ({ ...p, scheduled_time: e.target.value }))}
                      required
                      className="w-full bg-bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-accent-purple transition-colors"
                    />
                  </div>
                </div>

                {/* Proof URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Proof link{' '}
                    <span className="text-gray-600 font-normal">(VOD, tweet, etc.)</span>
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="url"
                      value={form.proof_url}
                      onChange={(e) => setForm((p) => ({ ...p, proof_url: e.target.value }))}
                      placeholder="https://..."
                      className="w-full bg-bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple transition-colors"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes (optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="What did you stream/review?"
                    rows={2}
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-accent-purple hover:bg-accent-purple-light disabled:opacity-50 transition-colors text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Logging...</>
                  ) : (
                    <><Send className="w-4 h-4" />{selectedEntry ? 'Update Entry' : 'Log Stream'}</>
                  )}
                </button>
              </form>
            </div>

            {/* Recent payments */}
            {payments.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Payments</h3>
                <div className="space-y-2">
                  {payments.slice(0, 4).map((payment) => (
                    <div key={payment.id} className="bg-bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {payment.amount ? `${payment.amount} ${payment.currency}` : 'Payment'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatDate(payment.created_at)}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getPaymentStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
