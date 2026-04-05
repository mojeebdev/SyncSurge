'use client'

import { useState } from 'react'
import { X, DollarSign, Hash, FileText, Loader2, Send } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  paymentId: string
  creatorName: string
  currentAmount?: number | null
  currency?: string
  onClose: () => void
  onSuccess: () => void
}

export default function PaymentModal({ paymentId, creatorName, currentAmount, currency = 'USD', onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    amount: currentAmount?.toString() || '',
    tx_hash: '',
    notes: '',
  })

  async function handleMarkSent() {
    setLoading(true)
    try {
      const res = await fetch(`/api/payments/${paymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'sent',
          amount: form.amount ? parseFloat(form.amount) : undefined,
          tx_hash: form.tx_hash || undefined,
          notes: form.notes || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to update payment')
        return
      }
      toast.success(`Payment marked as sent to ${creatorName}! Notification sent.`)
      onSuccess()
      onClose()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="font-semibold">Mark Payment Sent</h2>
            <p className="text-sm text-gray-500 mt-0.5">To: {creatorName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-white hover:bg-bg-secondary rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Amount ({currency})</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="number"
                step="0.0001"
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                placeholder="0.00"
                className="w-full bg-bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple transition-colors"
              />
            </div>
          </div>

          {/* TX Hash */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Transaction hash (optional)</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={form.tx_hash}
                onChange={(e) => setForm((p) => ({ ...p, tx_hash: e.target.value }))}
                placeholder="0x..."
                className="w-full bg-bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple transition-colors font-mono"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notes (optional)</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Payment note..."
                rows={2}
                className="w-full bg-bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple transition-colors resize-none"
              />
            </div>
          </div>

          <div className="bg-accent-purple/10 border border-accent-purple/20 rounded-xl px-4 py-3 text-xs text-accent-purple-light">
            Marking as sent will notify the creator immediately.
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-border text-gray-400 hover:text-white hover:border-border-light text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleMarkSent}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-accent-purple hover:bg-accent-purple-light disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Sending...</>
            ) : (
              <><Send className="w-4 h-4" />Mark as Sent</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
