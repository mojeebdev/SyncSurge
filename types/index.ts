import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession['user']
  }
  interface JWT {
    id: string
    role: UserRole
  }
}

export type UserRole = 'creator' | 'admin'

export interface Profile {
  id: string
  user_id: string
  email: string
  name: string | null
  username: string | null  // ← added
  x_handle: string | null
  wallet_address: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface StreamEntry {
  id: string
  creator_id: string
  scheduled_date: string
  scheduled_time: string
  status: 'scheduled' | 'completed' | 'missed'
  proof_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Payment {
  id: string
  creator_id: string
  stream_entry_id: string | null
  amount: number | null
  currency: string
  status: 'pending' | 'sent'
  tx_hash: string | null
  notes: string | null
  sent_at: string | null
  created_at: string
  updated_at: string
  stream_entries?: StreamEntry
  profiles?: Profile
}

export interface Notification {
  id: string
  user_id: string
  message: string
  type: 'payment_sent' | 'stream_reminder' | 'general'
  read: boolean
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface DashboardStats {
  totalCreators: number
  streamedToday: number
  pendingPayments: number
  totalPaid: number
}
