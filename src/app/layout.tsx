import type { Metadata } from 'next'
import React from 'react'
import './globals.css'

const siteUrl = 'https://denarii-mvp--denarii-mvp-f5aea.us-central1.hosted.app';

export const metadata: Metadata = {
  title: 'Denarii',
  description: 'Get rational advice on your purchasing decisions',
  openGraph: {
    title: 'Denarii',
    description: 'Get rational advice on your purchasing decisions',
    url: siteUrl,
    siteName: 'Denarii',
    images: [
      {
        url: `${siteUrl}/og-image.png`, // Must be an absolute URL
        width: 1200,
        height: 630,
        alt: 'Denarii - Rational Purchasing Advisor',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Denarii',
    description: 'Get rational advice on your purchasing decisions',
    images: [`${siteUrl}/og-image.png`], // Must be an absolute URL
  },
}

const RootLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons8-money-96.png" type="image/png" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}

export default RootLayout