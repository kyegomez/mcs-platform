"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { MessageSquare, FileText, Activity, User, Command, DollarSign, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const Navigation = () => {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMobileMenuOpen])

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 ease-out",
          isScrolled
            ? "bg-black/90 backdrop-blur-xl border-b border-white/20 shadow-lg"
            : "bg-black/80 backdrop-blur-xl border-b border-white/10",
        )}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-mcs-blue to-mcs-blue-light flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="font-medium text-xl text-white transition-colors duration-200 group-hover:text-mcs-blue">
                MCS
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {routes.map((route, index) => (
                <Link
                  key={route.path}
                  href={route.path}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 btn-interactive",
                    pathname === route.path
                      ? "bg-mcs-blue/20 text-mcs-blue shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-white/10",
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="mr-2">{route.icon}</span>
                  {route.name}
                </Link>
              ))}

              {/* Command Palette Hint */}
              <div className="hidden lg:flex items-center gap-1 px-3 py-1.5 text-xs text-gray-400 bg-white/5 rounded-lg ml-4 transition-all duration-200 hover:bg-white/10">
                <Command className="h-3 w-3" />
                <span>+</span>
                <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">K</kbd>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-400 hover:text-white hover:bg-white/10 rounded-xl btn-interactive"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className={cn(
              "fixed top-16 left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 p-4",
              "animate-in slide-in-from-top-2 duration-300",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="space-y-2">
              {routes.map((route, index) => (
                <Link
                  key={route.path}
                  href={route.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 btn-mobile stagger-item",
                    pathname === route.path
                      ? "bg-mcs-blue/20 text-mcs-blue"
                      : "text-gray-300 hover:text-white hover:bg-white/10",
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {route.icon}
                  {route.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

export default Navigation
