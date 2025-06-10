"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { MessageSquare, FileText, Activity, User, Search, Command } from "lucide-react"
import { Button } from "@/components/ui/button"

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
          <div className="flex items-center gap-4">
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
            </nav>

            {/* Command Palette Trigger */}
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex items-center gap-2 border-white/20 text-gray-400 hover:text-white hover:bg-white/5 bg-white/5"
              onClick={() => {
                // This will be handled by the global keyboard listener
                const event = new KeyboardEvent("keydown", {
                  key: "k",
                  metaKey: true,
                  bubbles: true,
                })
                document.dispatchEvent(event)
              }}
            >
              <Search className="h-3 w-3" />
              <span className="text-xs">Search</span>
              <div className="flex items-center gap-0.5 ml-1">
                <Command className="h-2.5 w-2.5" />
                <span className="text-xs">K</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navigation
