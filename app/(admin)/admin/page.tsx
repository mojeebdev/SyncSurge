'use client'

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { Users, CheckCircle, DollarSign, TrendingUp, Search, RefreshCw, Loader2 } from 'lucide-react'
import Header from '@/components/layout/Header'
import CreatorTable from '@/components/admin/CreatorTable'

interface CreatorWithData {
  id: string
  name: string
  email: string
  x_handle: string | null
  wallet_address: string | null
  role: string
  created_at: string
  stream_entries: Array<{ id: string; scheduled_date: string; scheduled_time: string; status: string; proof_url: string | null }>
  payments: Array<{ id: string; amount: number | null; status: string; currency: string; sent_at: string | null }>
}

export default function AdminPage() {
  const [creators, setCreators] = useState<CreatorWithData[]>([])
  const [filtered, setFiltered] = useState<CreatorWithData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'streamed' | 'not-streamed' | 'pending-payment'>('all')

  const fetchCreators = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/creators')
      if (!res.ok) {
        toast.error('Failed to fetch creators')
        return
      }
      const data = await res.json()
      setCreators(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCreators() }, [fetchCreators])

  useEffect(() => {
    let result = [...creators]
    const today = new Date().toISOString().split('T')[0]

    if (filter === 'streamed') {
      result = result.filter((c) => c.stream_entries?.some((e) => e.scheduled_date === today))
    } else if (filter === 'not-streamed') {
      result = result.filter((c) => !c.stream_entries?.some((e) => e.scheduled_date === today))
    } else if (filter === 'pending-payment') {
      result = result.filter((c) => c.payments?.some((p) => p.status === 'pending'))
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.x_handle?.toLowerCase().includes(q)
      )
    }

    setFiltered(result)
  }, [creators, filter, search])

  const stats = {
    total: creators.length,
    streamedToday: creators.filter((c) => {
      const today = new Date().toISOString().split('T')[0]
      return c.stream_entries?.some((e) => e.scheduled_date === today)
    }).length,
    pendingPayments: creators.reduce((sum, c) => sum + (c.payments?.filter((p) => p.status === 'pending').length || 0), 0),
    totalPaid: creators.reduce((sum, c) => sum + (c.payments?.filter((p) => p.status === 'sent').length || 0), 0),
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Creator Management</h1>
            <p className="text-gray-400 mt-1">Monitor streams and manage payments</p>
          </div>
          <button
            onClick={fetchCreators}
            disabled={loading}
            className="flex items-center gap-2 bg-bg-card border border-border hover:border-border-light text-sm text-gray-400 hover:text-white px-4 py-2 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Creators', value: stats.total, icon: Users, color: 'text-accent-purple-light' },
            { label: 'Streamed Today', value: stats.streamedToday, icon: CheckCircle, color: 'text-green-400' },
            { label: 'Pending Payments', value: stats.pendingPayments, icon: DollarSign, color: 'text-yellow-400' },
            { label: 'Payments Sent', value: stats.totalPaid, icon: TrendingUp, color: 'text-cyan-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or X handle..."
              className="w-full bg-bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple transition-colors"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 bg-bg-card border border-border rounded-xl p-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'streamed', label: 'Streamed' },
              { key: 'not-streamed', label: 'Not Streamed' },
              { key: 'pending-payment', label: 'Pending Pay' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as typeof filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === f.key
                    ? 'bg-accent-purple text-white'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent-purple" />
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-600 mb-3">{filtered.length} creator{filtered.length !== 1 ? 's' : ''}</p>
            <CreatorTable creators={filtered as any} />
          </>
        )}
      </main>
    </div>
  )
}
