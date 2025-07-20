import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Munger Purchase Advisor',
  description: 'Get Charlie Munger\'s rational advice on your purchasing decisions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}