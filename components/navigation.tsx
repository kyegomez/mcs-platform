"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { MessageSquare, FileText, Activity, User, Command, DollarSign } from "lucide-react"

const Navigation = () => {
  const pathname = usePathname()

  const routes = [
    {
      name: "Health",
      path: "/",
      icon: <Activity className="h-5 w-5" />,
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
      name: "Pricing",
      path: "/pricing",
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      name: "Account",
      path: "/account",
      icon: <User className="h-5 w-5" />,
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-mcs-blue to-mcs-blue-light flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="font-medium text-xl text-white">MCS</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-1">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  pathname === route.path
                    ? "bg-mcs-blue/20 text-mcs-blue"
                    : "text-gray-400 hover:text-white hover:bg-white/5",
                )}
              >
                <span className="hidden sm:block">{route.name}</span>
                <span className="sm:hidden">{route.icon}</span>
              </Link>
            ))}

            {/* Command Palette Hint */}
            <div className="hidden lg:flex items-center gap-1 px-3 py-1.5 text-xs text-gray-400 bg-white/5 rounded-lg ml-4">
              <Command className="h-3 w-3" />
              <span>+</span>
              <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">K</kbd>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Navigation
