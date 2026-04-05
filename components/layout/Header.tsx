'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Zap, LayoutDashboard, User, Users, LogOut, Menu, X, ShieldCheck } from 'lucide-react'
import NotificationBell from '@/components/creator/NotificationBell'

export default function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAdmin = session?.user?.role === 'admin'

  const creatorNav = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  const adminNav = [
    { href: '/admin', label: 'Creators', icon: Users },
  ]

  const nav = isAdmin ? adminNav : creatorNav

  return (
    <header className="border-b border-border sticky top-0 z-50 glass">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold hidden sm:block">SyncSurge</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'bg-accent-purple/20 text-accent-purple-light'
                  : 'text-gray-400 hover:text-white hover:bg-bg-card'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {!isAdmin && <NotificationBell />}

          {isAdmin && (
            <div className="hidden sm:flex items-center gap-1.5 bg-accent-purple/10 text-accent-purple-light text-xs font-medium px-2.5 py-1.5 rounded-lg border border-accent-purple/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </div>
          )}

          <div className="hidden sm:flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{session?.user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="p-2 text-gray-500 hover:text-white hover:bg-bg-card rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="sm:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-border bg-bg-secondary px-4 py-3 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                pathname === item.href
                  ? 'bg-accent-purple/20 text-accent-purple-light'
                  : 'text-gray-400'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
          <div className="border-t border-border pt-2 mt-2">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-400 w-full"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
