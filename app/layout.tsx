import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';
import { clsx } from 'clsx';
import SmoothScroll from '@/components/effects/SmoothScroll';
import CursorLight from '@/components/effects/CursorLight';
import ParallaxGrid from '@/components/effects/ParallaxGrid';
import Navbar from '@/components/layout/Navbar';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Rizwan Adji Pratama Putra | Independent Builder',
  description:
    'Independent builder focused on laboratory instrumentation, electronics repair, and system development.',

  applicationName: 'porto adji',

  manifest: '/manifest.json',

  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon0.svg', type: 'image/svg+xml' },
      { url: '/icon1.png', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },

  other: {
    'apple-mobile-web-app-title': 'porto adji',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={clsx(playfair.variable, dmSans.variable)}>
      <body className="antialiased min-h-screen bg-black text-white selection:bg-white selection:text-black">
        <SmoothScroll>
          <CursorLight />
          <ParallaxGrid />
          <Navbar />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}