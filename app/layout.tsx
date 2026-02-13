import type { Metadata } from "next"
import "./globals.css"
import { ToastProvider } from "@/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"

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
      <body className="font-sans antialiased">
        <ToastProvider>
          {children}
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  )
}
