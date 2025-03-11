"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ConnectionRequestBadge } from "@/components/ConnectionRequestBadge"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const storedUserId = localStorage.getItem("userId")
    setIsLoggedIn(!!token)
    setUserId(storedUserId)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    setIsLoggedIn(false)
    setUserId(null)
    router.push("/")
  }

  return (
    <nav className="bg-background border-b fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold">Skill Exchange</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink href="/" active={pathname === "/"}>
                Home
              </NavLink>
              <NavLink href="/skills" active={pathname === "/skills"}>
                Skills
              </NavLink>
              <NavLink href="/reviews" active={pathname === "/reviews"}>
                Reviews
              </NavLink>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isLoggedIn ? (
              <>
                <Button asChild variant="ghost">
                  <Link href={`/profile/${userId}`}>Profile</Link>
                </Button>
                <div className="mr-4">
                  <ConnectionRequestBadge />
                </div>
                <Button onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  )
}

