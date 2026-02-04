import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { CommandMenuProvider } from '@/components/command/CommandMenu'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Time-Blocking Calendar',
  description: 'Personal time-blocking calendar app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <CommandMenuProvider>
          {children}
          <Toaster />
        </CommandMenuProvider>
      </body>
    </html>
  )
}
