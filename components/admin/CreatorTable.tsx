'use client'

import Link from 'next/link'
import { format, parseISO, isToday } from 'date-fns'
import { Twitter, Wallet, CheckCircle, Clock, XCircle, ChevronRight, User } from 'lucide-react'
import { Profile, StreamEntry, Payment } from '@/types'
import { truncateAddress } from '@/lib/utils'

interface CreatorWithData extends Profile {
  stream_entries: StreamEntry[]
  payments: Payment[]
}

interface Props {
  creators: CreatorWithData[]
}

export default function CreatorTable({ creators }: Props) {
  function getTodayEntry(creator: CreatorWithData): StreamEntry | null {
    return creator.stream_entries?.find((e) => isToday(parseISO(e.scheduled_date))) || null
  }

  function getPendingPayments(creator: CreatorWithData): number {
    return creator.payments?.filter((p) => p.status === 'pending').length || 0
  }

  if (creators.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-12 text-center">
        <User className="w-12 h-12 mx-auto mb-3 text-gray-600" />
        <h3 className="font-semibold text-gray-400 mb-1">No creators yet</h3>
        <p className="text-sm text-gray-600">Creators will appear here once they sign up.</p>
      </div>
    )
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left px-5 py-3.5 font-medium">Creator</th>
              <th className="text-left px-4 py-3.5 font-medium hidden sm:table-cell">Socials</th>
              <th className="text-left px-4 py-3.5 font-medium">Today</th>
              <th className="text-left px-4 py-3.5 font-medium hidden md:table-cell">Pending Payments</th>
              <th className="text-left px-4 py-3.5 font-medium hidden lg:table-cell">Joined</th>
              <th className="px-4 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {creators.map((creator) => {
              const todayEntry = getTodayEntry(creator)
              const pendingCount = getPendingPayments(creator)

              return (
                <tr key={creator.id} className="border-b border-border/50 last:border-0 hover:bg-bg-secondary/50 transition-colors">
                  {/* Creator info */}
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-white">{creator.name || 'Unnamed'}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{creator.email}</p>
                    </div>
                  </td>

                  {/* Socials */}
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <div className="flex flex-col gap-1">
                      {creator.x_handle && (
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                          <Twitter className="w-3 h-3" />
                          <span>{creator.x_handle}</span>
                        </div>
                      )}
                      {creator.wallet_address && (
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                          <Wallet className="w-3 h-3" />
                          <span className="font-mono">{truncateAddress(creator.wallet_address)}</span>
                        </div>
                      )}
                      {!creator.x_handle && !creator.wallet_address && (
                        <span className="text-gray-600 text-xs">—</span>
                      )}
                    </div>
                  </td>

                  {/* Today's status */}
                  <td className="px-4 py-4">
                    {todayEntry ? (
                      <div className="flex items-center gap-2">
                        {todayEntry.status === 'completed' && (
                          <span className="flex items-center gap-1.5 text-green-400 text-xs bg-green-400/10 px-2.5 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Completed
                          </span>
                        )}
                        {todayEntry.status === 'scheduled' && (
                          <span className="flex items-center gap-1.5 text-cyan-400 text-xs bg-cyan-400/10 px-2.5 py-1 rounded-full">
                            <Clock className="w-3 h-3" /> Scheduled
                          </span>
                        )}
                        {todayEntry.status === 'missed' && (
                          <span className="flex items-center gap-1.5 text-red-400 text-xs bg-red-400/10 px-2.5 py-1 rounded-full">
                            <XCircle className="w-3 h-3" /> Missed
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-600 text-xs">Not logged</span>
                    )}
                  </td>

                  {/* Pending payments */}
                  <td className="px-4 py-4 hidden md:table-cell">
                    {pendingCount > 0 ? (
                      <span className="bg-yellow-400/10 text-yellow-400 text-xs px-2.5 py-1 rounded-full font-medium">
                        {pendingCount} pending
                      </span>
                    ) : (
                      <span className="text-gray-600 text-xs">None</span>
                    )}
                  </td>

                  {/* Joined */}
                  <td className="px-4 py-4 hidden lg:table-cell text-gray-500 text-xs">
                    {format(parseISO(creator.created_at), 'MMM d, yyyy')}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/creators/${creator.username}`}
                      className="flex items-center gap-1 text-accent-purple-light hover:text-white text-xs font-medium transition-colors"
                    >
                      View <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
