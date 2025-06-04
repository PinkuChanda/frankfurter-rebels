"use client"

import Image from "next/image"
import { LogOut, Key, User, Users, Camera, FileText, BarChart3, Info, Phone, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { type FormEvent, useState, useEffect } from "react"

interface DashboardStats {
  totalPlayers: number
  totalImages: number
  totalSections: number
  totalStats: number
}

const Page = () => {
  const router = useRouter()
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")

  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalImages: 0,
    totalSections: 0,
    totalStats: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [playersRes, galleryRes, sectionsRes, statsRes] = await Promise.all([
          fetch("/api/players"),
          fetch("/api/gallery"),
          fetch("/api/sections"),
          fetch("/api/team-stats"),
        ])

        const [players, gallery, sections, teamStats] = await Promise.all([
          playersRes.json(),
          galleryRes.json(),
          sectionsRes.json(),
          statsRes.json(),
        ])

        setStats({
          totalPlayers: Array.isArray(players) ? players.length : 0,
          totalImages: Array.isArray(gallery) ? gallery.length : 0,
          totalSections: Array.isArray(sections) ? sections.length : 0,
          totalStats: Array.isArray(teamStats) ? teamStats.length : 0,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/cricket/login")
      router.refresh()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordError("")
    setPasswordSuccess("")

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match")
      setPasswordLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      setPasswordLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Password change failed")
      }

      setPasswordSuccess("Password changed successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => {
        setShowPasswordDialog(false)
        setPasswordSuccess("")
      }, 2000)
    } catch (err: any) {
      setPasswordError(err.message)
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      {/* Header with Logo and Actions */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-amber-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-red-600 p-1 shadow-lg shadow-amber-500/20">
                <Image
                  src="/team-logo.png"
                  alt="Frankfurter Rebels"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-amber-400 text-sm">Frankfurter Rebels Cricket</p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {/* Change Password */}
              <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-amber-400">Change Password</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    {passwordError && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-lg text-sm">
                        {passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="bg-green-500/10 border border-green-500/20 text-green-300 p-3 rounded-lg text-sm">
                        {passwordSuccess}
                      </div>
                    )}
                    <div>
                      <Label htmlFor="currentPassword" className="text-white">
                        Current Password
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword" className="text-white">
                        New Password
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword" className="text-white">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                        required
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="submit"
                        disabled={passwordLoading}
                        className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700"
                      >
                        {passwordLoading ? "Changing..." : "Change Password"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPasswordDialog(false)}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* View Website */}
              <Button
                asChild
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Link href="/">
                  <User className="w-4 h-4 mr-2" />
                  View Website
                </Link>
              </Button>

              {/* Logout */}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the existing dashboard content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-medium">Total Players</p>
                  <p className="text-3xl font-bold text-white">{stats.totalPlayers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm font-medium">Gallery Images</p>
                  <p className="text-3xl font-bold text-white">{stats.totalImages}</p>
                </div>
                <Camera className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-medium">Content Sections</p>
                  <p className="text-3xl font-bold text-white">{stats.totalSections}</p>
                </div>
                <FileText className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/20 to-red-600/20 border-amber-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-300 text-sm font-medium">Team Stats</p>
                  <p className="text-3xl font-bold text-white">{stats.totalStats}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Players Management */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-400" />
                Players Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/cricket/players">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Players
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
              >
                <Link href="/cricket/players/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Player
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Gallery Management */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center">
                <Camera className="w-5 h-5 mr-2 text-green-400" />
                Gallery Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white">
                <Link href="/cricket/gallery">
                  <Camera className="w-4 h-4 mr-2" />
                  Manage Gallery
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full border-green-500/30 text-green-300 hover:bg-green-500/20"
              >
                <Link href="/cricket/gallery/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Image
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Content Management */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-400" />
                Content Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                <Link href="/cricket/sections">
                  <FileText className="w-4 h-4 mr-2" />
                  Manage Sections
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
              >
                <Link href="/cricket/sections/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Section
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* About Us Management */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center">
                <Info className="w-5 h-5 mr-2 text-cyan-400" />
                About Us Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                <Link href="/cricket/about">
                  <Info className="w-4 h-4 mr-2" />
                  Manage About Content
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
              >
                <Link href="/cricket/about/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add About Section
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Contact Management */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center">
                <Phone className="w-5 h-5 mr-2 text-orange-400" />
                Contact Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                <Link href="/cricket/contact">
                  <Phone className="w-4 h-4 mr-2" />
                  Manage Contact Info
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full border-orange-500/30 text-orange-300 hover:bg-orange-500/20"
              >
                <Link href="/cricket/contact/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact Info
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Team Stats Management */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-amber-400" />
                Team Stats Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white"
              >
                <Link href="/cricket/stats">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Manage Team Stats
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
              >
                <Link href="/cricket/stats/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Stat
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Page
