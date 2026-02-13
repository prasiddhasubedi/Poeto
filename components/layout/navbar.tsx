"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Menu, X, PenLine, LogOut, User, Home } from "lucide-react"
import { Avatar } from "@/components/shared/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface NavbarProps {
  user?: {
    id: string
    username: string
    display_name: string
    profile_picture_url: string | null
  } | null
}

export function Navbar({ user }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/home" className="flex items-center space-x-2">
            <PenLine className="h-6 w-6" />
            <span className="text-xl font-bold">Poeto</span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search poems, poets..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button asChild>
                  <Link href="/create">
                    <PenLine className="h-4 w-4 mr-2" />
                    Create
                  </Link>
                </Button>

                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                  >
                    <Avatar
                      src={user.profile_picture_url}
                      alt={user.display_name}
                      size="sm"
                    />
                  </button>

                  {profileMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setProfileMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-background border rounded-lg shadow-lg z-50">
                        <div className="p-3 border-b">
                          <p className="font-semibold">{user.display_name}</p>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            href={`/${user.username}`}
                            className="flex items-center px-4 py-2 text-sm hover:bg-accent"
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <User className="h-4 w-4 mr-2" />
                            Profile
                          </Link>
                          <Link
                            href="/home"
                            className="flex items-center px-4 py-2 text-sm hover:bg-accent"
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <Home className="h-4 w-4 mr-2" />
                            Home
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent text-destructive"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            {/* Mobile Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search poems, poets..."
                  className="pl-9"
                />
              </div>
            </div>

            {user ? (
              <div className="space-y-2">
                {/* User Info */}
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Avatar
                    src={user.profile_picture_url}
                    alt={user.display_name}
                    size="md"
                  />
                  <div>
                    <p className="font-semibold">{user.display_name}</p>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>
                </div>

                {/* Mobile Navigation Links */}
                <Link href="/home" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </Link>
                <Link href="/create" onClick={closeMobileMenu}>
                  <Button className="w-full justify-start">
                    <PenLine className="h-4 w-4 mr-2" />
                    Create Poem
                  </Button>
                </Link>
                <Link href={`/${user.username}`} onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive"
                  onClick={() => {
                    closeMobileMenu()
                    handleSignOut()
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link href="/login" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" onClick={closeMobileMenu}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
