// app/layout.js
// Champions Park — Root Layout

import { LanguageProvider } from '@/lib/LanguageContext'

export const metadata = {
  title: 'Champions Park — AI Fitness Coach',
  description: 'Your AI-powered fitness coach. Built for real results. Free beta — 300 spots only.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Champions Park',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Champions Park" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        <link rel="icon" href="/logo.svg" />
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
            font-family: Georgia, system-ui, -apple-system, sans-serif;
            background: #E8F5E9;
            color: #1B3A2A;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 3px; }
          ::selection { background: #2D5A2D; color: white; }
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus {
            -webkit-box-shadow: 0 0 0px 1000px #FDFCFA inset;
            -webkit-text-fill-color: #1B3A2A;
          }
        `}</style>
      </head>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
