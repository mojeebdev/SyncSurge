import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'SyncSurge — Creator Accountability Platform',
  description: 'Track creator streaming accountability and streamline payments for Surge.xyz partners.',
  keywords: ['creator', 'accountability', 'streaming', 'payments', 'surge'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg-primary text-white antialiased min-h-screen">
        <Providers>
          {children}
        </Providers>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e1e30',
              color: '#fff',
              border: '1px solid #2d2d4a',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#7c3aed', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  )
}
