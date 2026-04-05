'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, parseISO, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight, CheckCircle, Clock, XCircle } from 'lucide-react'
import { StreamEntry } from '@/types'

interface Props {
  entries: StreamEntry[]
  onDayClick?: (date: Date) => void
  selectedDate?: Date | null
}

export default function AccountabilityCalendar({ entries, onDayClick, selectedDate }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDow = getDay(monthStart) // 0 = Sunday

  function getEntryForDay(date: Date): StreamEntry | undefined {
    return entries.find((e) => isSameDay(parseISO(e.scheduled_date), date))
  }

  function getDayStatus(date: Date) {
    const entry = getEntryForDay(date)
    if (!entry) return null
    return entry.status
  }

  function getDayStyle(date: Date) {
    const status = getDayStatus(date)
    const today = isToday(date)
    const isSelected = selectedDate && isSameDay(date, selectedDate)

    let base = 'relative flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all select-none '

    if (isSelected) {
      base += 'ring-2 ring-accent-purple ring-offset-1 ring-offset-bg-card '
    }

    if (today && !status) {
      base += 'bg-accent-purple/20 text-accent-purple-light font-bold '
    } else if (status === 'completed') {
      base += 'bg-green-500/15 text-green-400 '
    } else if (status === 'scheduled') {
      base += 'bg-cyan-500/15 text-cyan-400 '
    } else if (status === 'missed') {
      base += 'bg-red-500/15 text-red-400 '
    } else {
      base += 'text-gray-400 hover:bg-bg-secondary hover:text-white '
    }

    return base
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="bg-bg-card border border-border rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold">{format(currentDate, 'MMMM yyyy')}</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1))}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-bg-secondary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-2.5 py-1 text-xs text-gray-500 hover:text-white hover:bg-bg-secondary rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1))}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-bg-secondary transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((d) => (
          <div key={d} className="text-center text-xs text-gray-600 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for start offset */}
        {Array.from({ length: startDow }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map((day) => {
          const entry = getEntryForDay(day)
          return (
            <div
              key={day.toISOString()}
              onClick={() => onDayClick?.(day)}
              className={`${getDayStyle(day)} aspect-square p-1`}
            >
              <span className="text-xs font-medium leading-none">{format(day, 'd')}</span>
              {entry && (
                <span className="mt-0.5">
                  {entry.status === 'completed' && <CheckCircle className="w-2.5 h-2.5" />}
                  {entry.status === 'scheduled' && <Clock className="w-2.5 h-2.5" />}
                  {entry.status === 'missed' && <XCircle className="w-2.5 h-2.5" />}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
        {[
          { color: 'bg-green-500/15 text-green-400', label: 'Completed', icon: CheckCircle },
          { color: 'bg-cyan-500/15 text-cyan-400', label: 'Scheduled', icon: Clock },
          { color: 'bg-red-500/15 text-red-400', label: 'Missed', icon: XCircle },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className={`w-3 h-3 rounded ${item.color.split(' ')[0]} flex items-center justify-center`}>
              <item.icon className="w-2 h-2" style={{ color: 'currentColor' }} />
            </div>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}
