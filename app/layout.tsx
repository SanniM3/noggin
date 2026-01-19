import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Inter } from 'next/font/google';
import './globals.css';

// Display font for letters and headings
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

// Body font for UI text
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Noggin Web - Fast-Paced Word Game',
  description: 'A polished, interactive word association game. Challenge your creativity and quick thinking with various rule modes.',
  keywords: ['word game', 'brain game', 'vocabulary', 'party game', 'quick thinking'],
  authors: [{ name: 'Noggin Web' }],
  openGraph: {
    title: 'Noggin Web - Fast-Paced Word Game',
    description: 'Challenge your creativity and quick thinking with this word association game.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a0f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-noggin-bg text-noggin-text antialiased">
        <div className="flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
