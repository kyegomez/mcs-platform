"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Grid3x3, MessageSquare, FileText, Bell, Menu, X, Home, User, FileBarChart } from "lucide-react"
import { useState, useEffect } from "react"
import { UserMenu } from "@/components/user-menu"
import { useAuth } from "@/contexts/auth-context"

const Navigation = () => {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const routes = [
    {
      name: "Home",
      path: "/",
      icon: <Home className="h-5 w-5" />,
      public: true,
    },
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Grid3x3 className="h-5 w-5" />,
      requiresAuth: true,
    },
    {
      name: "Chat",
      path: "/chat",
      icon: <MessageSquare className="h-5 w-5" />,
      public: true,
    },
    {
      name: "Notes",
      path: "/notes",
      icon: <FileText className="h-5 w-5" />,
      public: true,
    },
    {
      name: "Alerts",
      path: "/alerts",
      icon: <Bell className="h-5 w-5" />,
      public: true,
    },
    {
      name: "Medical Profile",
      path: "/profile/medical",
      icon: <FileBarChart className="h-5 w-5" />,
      requiresAuth: true,
      mobileOnly: true,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <User className="h-5 w-5" />,
      requiresAuth: true,
      mobileOnly: true,
    },
  ]

  // Filter routes based on auth status
  const filteredRoutes = routes.filter((route) => {
    if (!mounted) return true
    if (route.mobileOnly && !mobileMenuOpen) return false
    if (route.requiresAuth && !user) return false
    if (route.public) return true
    return true
  })

  return (
    <header className="sticky top-0 z-50 w-full border-b border-mcs-gray bg-black/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-mcs-blue">
              <div className="absolute inset-0 fluid-animation"></div>
              <span className="absolute inset-0 flex items-center justify-center font-bold text-white">M</span>
            </div>
            <span className="font-bold text-xl text-white">MCS</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {filteredRoutes
            .filter((route) => !route.mobileOnly)
            .map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  pathname === route.path
                    ? "bg-mcs-blue text-white"
                    : "text-mcs-gray-light hover:text-white hover:bg-mcs-gray",
                )}
              >
                {route.icon}
                <span className="ml-2">{route.name}</span>
              </Link>
            ))}
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          {mounted && <UserMenu />}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-mcs-gray-light hover:text-white hover:bg-mcs-gray"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden py-2 px-4 border-t border-mcs-gray bg-black">
          {filteredRoutes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                pathname === route.path
                  ? "bg-mcs-blue text-white"
                  : "text-mcs-gray-light hover:text-white hover:bg-mcs-gray",
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {route.icon}
              <span className="ml-2">{route.name}</span>
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}

export default Navigation
