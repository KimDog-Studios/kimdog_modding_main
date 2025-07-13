import './globals.css'
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' })

export const metadata: Metadata = {
  title: 'KimDog Modding',
  description: "KimDog's modding website",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetBrainsMono.variable}`}>
      <body
        className="flex min-h-screen flex-col antialiased"
        style={{ backgroundColor: '#181818', color: '#eee', fontFamily: 'var(--font-inter), sans-serif' }}
      >
        <main className="flex-grow">{children}</main>

        {/* Horizontal line above payment methods */}
        <hr className="border-t border-gray-700 w-full" />

        {/* Payment Methods (like Shopify) */}
        <div className="py-4 px-6">
          <div className="mx-auto max-w-screen-xl flex flex-wrap items-center justify-center gap-4">
            <img
              src="https://img.icons8.com/color/48/visa.png"
              alt="Visa"
              className="h-6"
            />
            <img
              src="https://img.icons8.com/color/48/mastercard-logo.png"
              alt="Mastercard"
              className="h-6"
            />
            <img
              src="https://img.icons8.com/color/48/amex.png"
              alt="Amex"
              className="h-6"
            />
            <img
              src="https://img.icons8.com/color/48/discover.png"
              alt="Discover"
              className="h-6"
            />
            <img
              src="https://img.icons8.com/color/48/diners-club.png"
              alt="Diners Club"
              className="h-6"
            />
            <img
              src="https://img.icons8.com/color/48/paypal.png"
              alt="PayPal"
              className="h-6"
            />
            <img
              src="https://imgs.search.brave.com/5av9WbNcpOg7gVonYuemn0EXOwHz3x03D9MyyNOh9no/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMuc2Vla2xvZ28u/Y29tL2xvZ28tcG5n/LzMwLzIvYXBwbGUt/cGF5LXBheW1lbnQt/bWFyay1sb2dvLXBu/Z19zZWVrbG9nby0z/MDYxNjcucG5n"
              alt="Apple Pay"
              className="h-6"
            />
            <img
              src="https://imgs.search.brave.com/4Sc4z9GO_GZ3PRUdOaEWtu1LGiauz5uNCDyIQGlu01M/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMuc2Vla2xvZ28u/Y29tL2xvZ28tcG5n/LzMyLzEvZ29vZ2xl/LXBheS1sb2dvLXBu/Z19zZWVrbG9nby0z/MjQ1NjMucG5n"
              alt="Google Pay"
              className="h-6"
            />
            <img
              src="https://imgs.search.brave.com/Bd4FBJRwjAzPRRD_CrnpH0gOU6vkIoKdGdiwhF52CQE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cGFnZXRyYWZmaWMu/Y29tL2Jsb2cvd3At/Y29udGVudC91cGxv/YWRzLzIwMjIvMDUv/YWJvdXQtc2hvcC1w/YXkuanBn"
              alt="Shop Pay"
              className="h-6"
            />
            <img
              src="https://imgs.search.brave.com/KnwqtivyqQ2dYV1g5UMY7qBzYoMqbG3lJhExzVUzJ7Q/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c3ZncmVwby5jb20v/c2hvdy81MDg2OTcv/a2xhcm5hLnN2Zw"
              alt="Klarna"
              className="h-6 bg-[#181818] px-1 py-0.5 rounded"
            />
            <img
              src="https://img.icons8.com/color/48/unionpay.png"
              alt="UnionPay"
              className="h-6"
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full border-gray-700 text-sm text-gray-400 bg-[#181818] border-b">
          <div className="mx-auto flex max-w-screen-xl flex-col sm:flex-row justify-between items-center px-4 py-6 sm:px-6 lg:px-8 gap-4">
            <span>© {new Date().getFullYear()} KimDog Studios. All rights reserved.</span>
            <div className="flex space-x-4">
              <a href="/terms" className="hover:underline">
                Terms
              </a>
              <a href="/privacy" className="hover:underline">
                Privacy
              </a>
              <a href="/contact" className="hover:underline">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
