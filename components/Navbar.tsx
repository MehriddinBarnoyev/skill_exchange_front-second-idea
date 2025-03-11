"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Users, LogOut, Home, Briefcase } from "lucide-react"
import { ConnectionRequestBadge } from "@/components/ConnectionRequestBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold gradient-text">
                Skill Exchange
              </Link>
            </div>
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <NavLink href="/dashboard" active={pathname === "/dashboard"}>
                  <Home className="w-4 h-4 mr-1" />
                  Dashboard
                </NavLink>
                <NavLink href="/connections" active={pathname.startsWith("/connections")}>
                  <Users className="w-4 h-4 mr-1" />
                  Connections
                </NavLink>
                <NavLink href="/skills" active={pathname.startsWith("/skills")}>
                  <Briefcase className="w-4 h-4 mr-1" />
                  Skills
                </NavLink>
              </div>
            )}
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <ConnectionRequestBadge />
                <Link
                  href={`/profile/${user.id}`}
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                    />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout} className="text-gray-700 hover:text-red-600">
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="btn-gradient">
                  <Link href="/register">Register</Link>
                </Button>
              </div>
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
          ? "border-blue-500 text-gray-900"
          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
      }`}
    >
      {children}
    </Link>
  )
}

