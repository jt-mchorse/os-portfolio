import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'James McHorse — OS Portfolio',
  description:
    'Interactive OS-style portfolio of James Travis McHorse — Senior AI/ML Engineer & Full-Stack Architect with 12+ years of experience.',
  keywords: ['AI engineer', 'full stack developer', 'React', 'Next.js', 'TypeScript', 'portfolio'],
  authors: [{ name: 'James Travis McHorse' }],
  openGraph: {
    title: 'James McHorse — OS Portfolio',
    description: 'An interactive OS-style portfolio — pick macOS or Arch Linux.',
    url: 'https://os.leftcoaststack.com',
    siteName: 'Left Coast Stack — James McHorse',
    type: 'website',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'Left Coast Stack',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'James McHorse — OS Portfolio',
    description: 'An interactive OS-style portfolio — pick macOS or Arch Linux.',
    images: ['/icon-512.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jetBrainsMono.variable} h-full`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1a294c" />
      </head>
      <body className="h-full overflow-hidden bg-black">{children}</body>
    </html>
  )
}
