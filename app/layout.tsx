import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/navbar" // Import the Navbar component

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Skill Exchange",
  description: "Connect with professionals and exchange skills",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <Navbar /> {/* Add the Navbar component here */}
          <div className="pt-16">
            {" "}
            {/* Add padding-top to prevent content from being hidden under the navbar */}
            {children}
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}

