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
    icon: MEDIA_URLS.FAVICON, // Handles the favicon from Firebase Storage
  },
  openGraph: {
    title: 'Denarii',
    description: 'Get rational advice on your purchasing decisions',
    url: siteUrl,
    siteName: 'Denarii',
    images: [
      {
        url: MEDIA_URLS.OG_IMAGE, // Firebase Storage URL
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
    images: [MEDIA_URLS.OG_IMAGE], // Firebase Storage URL
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
      </head>
      {/* The body tag includes the font class from Next/Font and Tailwind's antialiased class for smoother text. */}
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
