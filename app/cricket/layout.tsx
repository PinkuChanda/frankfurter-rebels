import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Cricket Admin Dashboard - Frankfurter Rebels",
  description: "Cricket admin dashboard for managing the Frankfurter Rebels cricket team website",
}

export default function CricketLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-black text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/cricket" className="text-xl font-bold">
            Frankfurter Rebels Cricket Admin
          </Link>
          <nav>
            <Link href="/" className="hover:text-amber-400 transition-colors">
              View Website
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
