import { ReactNode } from 'react'

import { JetBrains_Mono } from 'next/font/google'

import './globals.css'

const roboto = JetBrains_Mono({ subsets: ['cyrillic'] })

const Layout = ({ children }: { children: ReactNode }) => (
  <html lang="ru">
    <body className={roboto.className}>{children}</body>
  </html>
)

export default Layout
