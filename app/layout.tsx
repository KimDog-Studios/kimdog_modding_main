import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Downloads - KimDog Modding',
  description: "Downloads page for KimDog's modding website",
  viewport: 'width=device-width, initial-scale=1',
  keywords: 'modding, downloads, KimDog, games, mods',
  openGraph: {
    title: 'Downloads - KimDog Modding',
    description: "Download mods and tools from KimDog's modding website.",
    url: 'https://yourwebsite.com/downloads',
    siteName: 'KimDog Modding',
    images: [
      {
        url: 'https://yourwebsite.com/og-image.png',
        width: 800,
        height: 600,
        alt: 'KimDog Modding Downloads',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Downloads - KimDog Modding',
    description: "Download mods and tools from KimDog's modding website.",
    images: ['https://yourwebsite.com/twitter-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#000000" />
      </head>

      <body className="flex min-h-screen flex-col bg-black text-white antialiased font-sans">
        {/* Skip to content link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only p-2 bg-blue-600 text-white fixed top-2 left-2 z-50 rounded"
        >
          Skip to main content
        </a>

        <main id="main-content" className="flex-grow" aria-label="Main content area">
          {children}
        </main>

        {/* Horizontal line above payment methods */}
        <hr className="border-t border-gray-800 w-full" />

        {/* Payment Methods (Visa, Mastercard, PayPal only) */}
        <div className="bg-black py-4 px-6">
          <div
            className="mx-auto max-w-screen-xl flex flex-wrap items-center justify-center gap-4"
            role="contentinfo"
            aria-label="Accepted payment methods"
          >
            <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" className="h-6" />
            <img src="https://img.icons8.com/color/48/mastercard-logo.png" alt="Mastercard" className="h-6" />
            <img src="https://img.icons8.com/color/48/paypal.png" alt="PayPal" className="h-6" />
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full border-t border-gray-800 bg-black text-sm text-gray-400">
          <div className="mx-auto flex max-w-screen-xl flex-col sm:flex-row justify-between items-center px-4 py-6 sm:px-6 lg:px-8 gap-4">
            <span>© {new Date().getFullYear()} KimDog Studios. All rights reserved. Powered by KimDog.</span>
            <nav aria-label="Footer navigation">
              <div className="flex space-x-4">
                <a href="/terms" className="hover:underline" aria-current={false}>
                  Terms
                </a>
                <a href="/privacy" className="hover:underline" aria-current={false}>
                  Privacy
                </a>
                <a href="/contact" className="hover:underline" aria-current={false}>
                  Contact
                </a>
              </div>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  )
}
