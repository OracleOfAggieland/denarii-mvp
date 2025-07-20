import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Denarii',
  description: 'Get Charlie Munger\'s rational advice on your purchasing decisions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons8-money-96.png" type="image/png" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}