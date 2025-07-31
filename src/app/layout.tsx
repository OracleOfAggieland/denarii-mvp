// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import './globals.css';
import '../styles/App.css';
import { MEDIA_URLS } from '../lib/storage';

const inter = Inter({ subsets: ['latin'] });

// This should be your production URL - using the actual deployed URL that Facebook detects
const siteUrl = 'https://denarii-mvp--denarii-mvp-f5aea.us-central1.hosted.app';

// This metadata object now handles the title, description, icons, and social media cards.
export const metadata: Metadata = {
  title: 'Denarii',
  description: 'Get rational advice on your purchasing decisions',
  icons: {
    icon: [
      {
        url: MEDIA_URLS.FAVICON,
        type: 'image/png',
        sizes: '96x96',
      },
      // Multiple fallback options
      {
        url: 'https://firebasestorage.googleapis.com/v0/b/denarii-mvp-f5aea.appspot.com/o/icons8-money-96.png?alt=media',
        type: 'image/png',
        sizes: '96x96',
      },
      {
        url: '/favicon.ico',
        type: 'image/x-icon',
      }
    ],
    shortcut: MEDIA_URLS.FAVICON,
    apple: MEDIA_URLS.FAVICON,
  },
  openGraph: {
    title: 'Denarii',
    description: 'Get rational advice on your purchasing decisions',
    url: siteUrl,
    siteName: 'Denarii',
    images: [
      {
        url: MEDIA_URLS.OG_IMAGE,
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
    images: [MEDIA_URLS.OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Additional meta tags for better social media compatibility */}
        <meta property="og:image" content={MEDIA_URLS.OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta name="twitter:image" content={MEDIA_URLS.OG_IMAGE} />
        {/* Referrer policy for better external image loading */}
        <meta name="referrer" content="no-referrer-when-downgrade" />
        {/* Preconnect to Firebase Storage for faster loading */}
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
      </head>
      {/* The body tag includes the font class from Next/Font and Tailwind's antialiased class for smoother text. */}
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}