// app/layout.js
// Champions Park — Root Layout
// Wraps entire app with LanguageProvider for global language/RTL support

import { Inter } from 'next/font/google'
import { LanguageProvider } from '@/lib/LanguageContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Champions Park — AI Fitness Coach',
  description: 'Your AI-powered fitness coach. Built for real results. Free beta — 300 spots only.',
  keywords: 'fitness, workout, weight loss, bodybuilding, AI coach, champions park',
  openGraph: {
    title: 'Champions Park — AI Fitness Coach',
    description: 'Your AI-powered fitness coach. Built for real results.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <style>{`
          *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          html, body {
            height: 100%;
            width: 100%;
          }
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background: #E8F5E9;
            color: #1a1a1a;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          /* RTL support — flip margins/paddings automatically */
          [dir="rtl"] * {
            font-family: 'Inter', 'Segoe UI', Tahoma, Arial, sans-serif;
          }
          /* Scrollbar styling */
          ::-webkit-scrollbar {
            width: 6px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(0,0,0,0.2);
            border-radius: 3px;
          }
          /* Selection color */
          ::selection {
            background: #2D5A2D;
            color: white;
          }
          /* Input autofill fix */
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus {
            -webkit-box-shadow: 0 0 0px 1000px #f5f5f0 inset;
            -webkit-text-fill-color: #1a1a1a;
            transition: background-color 5000s ease-in-out 0s;
          }
        `}</style>
      </head>
      <body className={inter.className}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
