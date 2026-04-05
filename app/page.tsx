import Link from 'next/link'
import { ArrowRight, CheckCircle, Zap, Shield, BarChart3, Bell, Users } from 'lucide-react'

const features = [
  {
    icon: CheckCircle,
    title: 'Daily Accountability',
    description: 'Creators log their streams with time slots and proof links. Never miss a session.',
  },
  {
    icon: Zap,
    title: 'Instant Payments',
    description: 'Admin can trigger payments directly from dashboards. Supports wallet addresses.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Creators get notified the moment their payment is processed. Real-time updates.',
  },
  {
    icon: BarChart3,
    title: 'Admin Dashboard',
    description: 'Full visibility into creator activity, payment status, and stream history.',
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Manage your entire creator roster from one place. Filter, search, and act fast.',
  },
  {
    icon: Shield,
    title: 'Proof Verification',
    description: 'Creators submit proof links. Admins verify before marking sessions complete.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">SyncSurge</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm bg-accent-purple hover:bg-accent-purple-light transition-colors text-white px-4 py-2 rounded-lg font-medium"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-accent-purple/10 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-purple/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-accent-purple/10 border border-accent-purple/20 rounded-full px-4 py-1.5 text-sm text-accent-purple-light mb-6">
            <Zap className="w-3.5 h-3.5" />
            Powered by Surge.xyz
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 tracking-tight">
            Creator accountability,{' '}
            <span className="bg-gradient-to-r from-accent-purple-light to-accent-cyan bg-clip-text text-transparent">
              streamlined
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            The platform where creators log their streams, prove their work, and get paid — all managed from a single dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="flex items-center gap-2 bg-accent-purple hover:bg-accent-purple-light transition-all text-white px-6 py-3 rounded-xl font-semibold text-base glow-purple group"
            >
              Join as Creator
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 grid grid-cols-3 gap-8 text-center">
          {[
            { value: '100%', label: 'Transparency' },
            { value: 'Real-time', label: 'Notifications' },
            { value: 'Zero', label: 'Missed Payments' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold bg-gradient-to-r from-accent-purple-light to-accent-cyan bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Everything you need</h2>
            <p className="text-gray-400">Built for Surge.xyz partners and their creator teams</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-bg-card border border-border rounded-xl p-6 hover:border-accent-purple/40 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-accent-purple/10 flex items-center justify-center mb-4 group-hover:bg-accent-purple/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-accent-purple-light" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-bg-card to-bg-secondary border border-border rounded-2xl p-10">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-gray-400 mb-8">Join the platform and start tracking your accountability today.</p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-accent-purple hover:bg-accent-purple-light transition-all text-white px-8 py-3 rounded-xl font-semibold glow-purple"
            >
              Create your account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span>SyncSurge</span>
          </div>
          <p>© {new Date().getFullYear()} SyncSurge. Built for Surge.xyz creators.</p>
        </div>
      </footer>
    </div>
  )
}
