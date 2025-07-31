"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { MessageSquare, FileText, Activity, User, Command, DollarSign, Menu, X, Info, Settings, Bell, Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
            ? "bg-background/90 backdrop-blur-xl border-b border-border/20 shadow-lg"
            : "bg-background/80 backdrop-blur-xl border-b border-border/10",
        )}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-medium text-xl text-foreground transition-colors duration-200 group-hover:text-primary">
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
                      ? "bg-primary/20 text-primary shadow-lg"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="mr-2">{route.icon}</span>
                  {route.name}
                </Link>
              ))}


            </nav>

            {/* Right Side - User Menu Dropdown */}
            <div className="flex items-center gap-2">
              {/* Command Palette Hint */}
              <div className="hidden lg:flex items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground bg-accent/50 rounded-lg transition-all duration-200 hover:bg-accent">
                <Command className="h-3 w-3" />
                <span>+</span>
                <kbd className="px-1 py-0.5 bg-background/50 rounded text-xs">K</kbd>
              </div>

              {/* User Menu Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-background/80 transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-foreground">Account</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 p-2 bg-background/95 backdrop-blur-xl border border-border/50 shadow-xl rounded-2xl"
                >
                  {/* User Info Section */}
                  <div className="px-3 py-2 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">Welcome back!</p>
                        <p className="text-xs text-muted-foreground">Manage your account</p>
                      </div>
                    </div>
                  </div>

                  <DropdownMenuSeparator className="bg-border/50" />

                  {/* Quick Actions */}
                  <Link href="/chat">
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-accent transition-colors">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Search</span>
                    </DropdownMenuItem>
                  </Link>

                  <Link href="/alerts">
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-accent transition-colors relative">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Notifications</span>
                      <span className="absolute right-3 w-2 h-2 bg-red-500 rounded-full"></span>
                    </DropdownMenuItem>
                  </Link>

                  <DropdownMenuSeparator className="bg-border/50" />

                  {/* Account Section */}
                  <Link href="/account">
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-accent transition-colors">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Account Settings</span>
                    </DropdownMenuItem>
                  </Link>

                  <Link href="/account">
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-accent transition-colors">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Preferences</span>
                    </DropdownMenuItem>
                  </Link>

                  <DropdownMenuSeparator className="bg-border/50" />

                  {/* Additional Pages */}
                  <Link href="/about">
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-accent transition-colors">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">About</span>
                    </DropdownMenuItem>
                  </Link>

                  <Link href="/pricing">
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-accent transition-colors">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Pricing</span>
                    </DropdownMenuItem>
                  </Link>

                  <DropdownMenuSeparator className="bg-border/50" />

                  {/* Theme Toggle */}
                  <div className="px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Theme</span>
                      <ThemeToggle />
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
                className="md:hidden text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl btn-interactive"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
          <div
            className={cn(
              "fixed top-16 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/10 p-4",
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
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
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
