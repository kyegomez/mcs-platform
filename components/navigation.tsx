"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Grid3x3, MessageSquare, FileText, Bell, Menu, X, Activity, Calendar, Clock } from "lucide-react"
import { useState } from "react"

const Navigation = () => {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const routes = [
    {
      name: "Dashboard",
      path: "/",
      icon: <Grid3x3 className="h-5 w-5" />,
    },
    {
      name: "Chat",
      path: "/chat",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      name: "Notes",
      path: "/notes",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Calendar",
      path: "/calendar",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Reminders",
      path: "/reminders",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      name: "Alerts",
      path: "/alerts",
      icon: <Bell className="h-5 w-5" />,
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/10">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-gradient-to-br from-mcs-blue to-mcs-blue-light">
            <div className="absolute inset-0 fluid-animation rounded-xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <span className="font-bold text-xl gradient-text">MCS</span>
            <p className="text-xs text-mcs-gray-light">Modern Care System</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          {routes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                "flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden group",
                pathname === route.path
                  ? "bg-gradient-to-r from-mcs-blue to-mcs-blue-light text-white shadow-lg shadow-mcs-blue/25"
                  : "text-mcs-gray-light hover:text-white hover:bg-white/5 hover:backdrop-blur-sm",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-mcs-blue/20 to-mcs-blue-light/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-2">
                {route.icon}
                <span>{route.name}</span>
              </div>
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2.5 rounded-xl text-mcs-gray-light hover:text-white hover:bg-white/5 transition-all duration-300"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden py-4 px-4 border-t border-white/10 glass">
          <div className="space-y-2">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300",
                  pathname === route.path
                    ? "bg-gradient-to-r from-mcs-blue to-mcs-blue-light text-white shadow-lg"
                    : "text-mcs-gray-light hover:text-white hover:bg-white/5",
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {route.icon}
                <span className="ml-3">{route.name}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}

export default Navigation
