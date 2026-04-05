'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { User, Twitter, Wallet, Mail, Save, Loader2, Copy, Check } from 'lucide-react'
import Header from '@/components/layout/Header'
import { Profile } from '@/types'

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({
    name: '',
    x_handle: '',
    wallet_address: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [session])

  async function fetchProfile() {
    if (!session?.user?.id) return
    setLoading(true)
    try {
      const profileRes = await fetch('/api/profile')
      if (profileRes.ok) {
        const data = await profileRes.json()
        setProfile(data)
        setForm({
          name: data.name || '',
          x_handle: data.x_handle || '',
          wallet_address: data.wallet_address || '',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    try {
      const res = await fetch(`/api/creators/[creatorId]}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to save profile')
        return
      }
      const data = await res.json()
      setProfile(data)
      toast.success('Profile updated!')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  function copyWallet() {
    if (!profile?.wallet_address) return
    navigator.clipboard.writeText(profile.wallet_address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <p className="text-gray-400 mt-1">Manage your creator profile and payment details</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-accent-purple" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Avatar card */}
            <div className="bg-bg-card border border-border rounded-xl p-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {(profile?.name || session?.user?.email || 'U')[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-lg">{profile?.name || 'Creator'}</p>
                <p className="text-gray-400 text-sm">{profile?.email}</p>
                <span className="inline-flex items-center gap-1 mt-1 text-xs bg-accent-purple/10 text-accent-purple-light px-2 py-0.5 rounded-full">
                  Creator
                </span>
              </div>
            </div>

            {/* Edit form */}
            <div className="bg-bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold mb-5">Edit Profile</h2>
              <form onSubmit={handleSave} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Display name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Your name"
                      className="w-full bg-bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple transition-colors"
                    />
                  </div>
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full bg-bg-secondary/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
                </div>

                {/* X Handle */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">X (Twitter) handle</label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={form.x_handle}
                      onChange={(e) => setForm((p) => ({ ...p, x_handle: e.target.value }))}
                      placeholder="@yourhandle"
                      className="w-full bg-bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple transition-colors"
                    />
                  </div>
                </div>

                {/* Wallet */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Wallet address</label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={form.wallet_address}
                      onChange={(e) => setForm((p) => ({ ...p, wallet_address: e.target.value }))}
                      placeholder="0x... or SOL address"
                      className="w-full bg-bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple transition-colors font-mono"
                    />
                  </div>
                  {profile?.wallet_address && (
                    <button
                      type="button"
                      onClick={copyWallet}
                      className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {copied ? <><Check className="w-3 h-3 text-green-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy address</>}
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-accent-purple hover:bg-accent-purple-light disabled:opacity-50 transition-colors text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mt-2"
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                  ) : (
                    <><Save className="w-4 h-4" />Save Changes</>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
