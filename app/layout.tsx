import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Poeto - A Social Home for Poets",
  description: "Share, discover, and connect through poetry",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
