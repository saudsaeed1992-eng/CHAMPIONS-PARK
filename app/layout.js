export const metadata = {
  title: 'Champions Park 🏆',
  description: 'Where Champions Are Built. Free AI fitness plans powered by Claude AI.',
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
