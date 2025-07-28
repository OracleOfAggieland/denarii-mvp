import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import './globals.css';
import '../styles/App.css';

const inter = Inter({ subsets: ['latin'] });

// This should be your production URL
const siteUrl = 'https://denarii-mvp-f5aea.web.app';

// This metadata object now handles the title, description, icons, and social media cards.
export const metadata: Metadata = {
  title: 'Denarii',
  description: 'Get rational advice on your purchasing decisions',
  icons: {
    icon: '/icons8-money-96.png', // Handles the favicon
  },
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* The body tag includes the font class from Next/Font and Tailwind's antialiased class for smoother text. */}
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
