'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Users, DollarSign, Clock, Zap, LogOut, LayoutDashboard, CreditCard } from 'lucide-react'
import CreatorTable from '@/components/admin/CreatorTable'
import { Profile, StreamEntry, Payment } from '@/types'
import { isToday, parseISO } from 'date-fns'

interface CreatorWithData extends Profile {
  stream_entries: StreamEntry[]
  payments: Payment[]
}

interface Stats {
  totalCreators: number
  pendingPayments: number
  totalPaid: number
}

interface Props {
  creators: CreatorWithData[]
  stats: Stats
}

export default function AdminDashboardClient({ creators, stats }: Props) {
  const { data: session } = useSession()
  const streamedToday = creators.filter((c) =>
    c.stream_entries?.some((e) => isToday(parseISO(e.scheduled_date)) && e.status === 'completed')
  ).length

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-60 bg-bg-card border-r border-border z-40 flex flex-col">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">SyncSurge</p>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-accent-purple/10 text-accent-purple-light text-sm font-medium"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/admin/payments"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-bg-secondary text-sm font-medium transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            Payments
          </Link>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center text-white text-xs font-bold">
              {(session?.user?.name || 'A')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session?.user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors w-full"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-400 mt-1">Overview of your creator ecosystem</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Creators', value: stats.totalCreators, icon: Users, color: 'text-accent-purple-light', bg: 'bg-accent-purple/10' },
            { label: 'Streamed Today', value: streamedToday, icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
            { label: 'Pending Payments', value: stats.pendingPayments, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
            { label: 'Total Paid Out', value: `$${stats.totalPaid.toLocaleString()}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-400/10' },
          ].map((stat) => (
            <div key={stat.label} className="bg-bg-card border border-border rounded-xl p-5">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Creators table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Creators</h2>
            <span className="text-sm text-gray-500">{creators.length} total</span>
          </div>
          <CreatorTable creators={creators} />
        </div>
      </main>
    </div>
  )
}
