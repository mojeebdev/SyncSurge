import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, isToday, isFuture, isPast } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy')
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${minutes} ${ampm}`
}

export function formatDateTime(date: string, time: string): string {
  return `${formatDate(date)} at ${formatTime(time)}`
}

export function getStreamStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'text-green-400 bg-green-400/10'
    case 'scheduled': return 'text-cyan-400 bg-cyan-400/10'
    case 'missed': return 'text-red-400 bg-red-400/10'
    default: return 'text-gray-400 bg-gray-400/10'
  }
}

export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'sent': return 'text-green-400 bg-green-400/10'
    case 'pending': return 'text-yellow-400 bg-yellow-400/10'
    default: return 'text-gray-400 bg-gray-400/10'
  }
}

export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function truncateAddress(address: string, chars = 4): string {
  if (!address) return ''
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const date = new Date(year, month, 1)
  while (date.getMonth() === month) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }
  return days
}
