"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Flag, User } from "lucide-react"
import Image from "next/image"
import { SimpleNavigation } from "@/components/simple-navigation"
import { Footer } from "@/components/footer"

interface Player {
  id: number
  name: string
  role: string
  image_url: string
  experience: string
  description: string
  is_owner: boolean
  owner_title: string
  is_captain: boolean
  matches: number
  runs: number
  wickets: number
  is_management?: boolean
  management_role?: string
}

// Component for handling image with fallback
function PlayerImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  // Function to check if URL is safe to load
  const isSafeImageUrl = (url: string): boolean => {
    if (!url || typeof url !== "string" || url.trim() === "") return false

    // Block all problematic URL patterns
    const blockedPatterns = [
      "blob:",
      "vusercontent.net",
      "lite.vusercontent.net",
      "data:text/html",
      "javascript:",
      "file:",
      "chrome:",
      "about:",
    ]

    const lowerUrl = url.toLowerCase()
    return !blockedPatterns.some((pattern) => lowerUrl.includes(pattern))
  }

  // Determine if we should show placeholder
  const shouldShowPlaceholder = !isSafeImageUrl(src)

  if (shouldShowPlaceholder) {
    return (
      <div
        className={`${className} bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600`}
      >
        <div className="text-center p-4">
          <User className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">{alt}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={300}
        height={300}
        className={className}
        onError={(e) => {
          // Replace with placeholder on error
          const target = e.target as HTMLImageElement
          target.style.display = "none"
          const parent = target.parentElement
          if (parent) {
            parent.innerHTML = `
              <div class="${className} bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600">
                <div class="text-center p-4">
                  <svg class="w-12 h-12 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <p class="text-xs text-slate-400 font-medium">${alt}</p>
                </div>
              </div>
            `
          }
        }}
        priority={false}
      />
    </div>
  )
}

export default function TeamPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [management, setManagement] = useState<Player[]>([])

  useEffect(() => {
    async function fetchPlayers() {
      try {
        console.log("Fetching players...")
        const response = await fetch("/api/players")
        if (!response.ok) {
          throw new Error(`Failed to fetch players: ${response.status}`)
        }
        const data = await response.json()
        console.log("Raw players data:", data)

        // Filter and clean player data
        const validPlayers = data
          .filter((player: any) => {
            if (!player || !player.name || typeof player.name !== "string") {
              console.log("Filtering out invalid player:", player)
              return false
            }
            return true
          })
          .map((player: any) => {
            // Clean the image URL - if it's problematic, set to empty string
            let cleanImageUrl = ""
            if (player.image_url && typeof player.image_url === "string") {
              const url = player.image_url.toLowerCase()
              if (
                !url.includes("blob:") &&
                !url.includes("vusercontent.net") &&
                !url.includes("data:text/html") &&
                url.startsWith("http")
              ) {
                cleanImageUrl = player.image_url
              }
            }

            console.log(`Player ${player.name} - Original URL: ${player.image_url}, Clean URL: ${cleanImageUrl}`)

            return {
              ...player,
              image_url: cleanImageUrl,
              // Ensure all required fields have defaults
              role: player.role || "Player",
              description: player.description || "No description available",
              matches: player.matches || 0,
              runs: player.runs || 0,
              wickets: player.wickets || 0,
              is_owner: Boolean(player.is_owner),
              is_captain: Boolean(player.is_captain),
              is_management: Boolean(player.is_management),
              owner_title: player.owner_title || "",
              management_role: player.management_role || "",
            }
          })

        console.log(`Processed ${validPlayers.length} valid players`)
        setPlayers(validPlayers)

        // Filter management staff
        const managementStaff = validPlayers.filter((player: Player) => player.is_management)
        console.log(`Found ${managementStaff.length} management staff`)
        setManagement(managementStaff)
      } catch (err: any) {
        console.error("Error fetching players:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white">
        <SimpleNavigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <span className="text-lg">Loading team...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white">
        <SimpleNavigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-md p-6 bg-red-900/20 rounded-lg border border-red-500/20">
            <h2 className="text-xl font-bold mb-4">Error Loading Team</h2>
            <p className="text-sm mb-4">{error}</p>
            <button
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Show message if no players found
  if (players.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white">
        <SimpleNavigation />

        <section className="px-4 py-10 pt-40">
          <div className="max-w-7xl mx-auto text-center space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">
              Our Team
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Meet the talented individuals who make up the Frankfurter Rebels.
            </p>
          </div>
        </section>

        <section className="px-4 py-16">
          <div className="max-w-7xl mx-auto text-center">
            <div className="bg-white/5 backdrop-blur-sm border-white/10 rounded-2xl p-12">
              <User className="w-24 h-24 text-slate-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Team Coming Soon</h3>
              <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                We're currently building our team roster. Check back soon to meet our amazing players!
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white">
      <SimpleNavigation />

      {/* Hero Section */}
      <section className="px-4 py-10 pt-40">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <h1 className="text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">
            Our Team
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Meet the talented individuals who make up the Frankfurter Rebels. Each player brings unique skills and
            passion to our team.
          </p>
          <div className="text-amber-400 text-sm font-medium">
            {players.length} Team Member{players.length !== 1 ? "s" : ""}
          </div>
        </div>
      </section>

      {/* Players Section */}
      <section className="px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {players
              .sort((a, b) => {
                // Sort by: Owner first, then Co-Owner, then Captain, then others
                if (a.is_owner && a.owner_title?.includes("Owner") && !a.owner_title?.includes("Co")) return -1
                if (b.is_owner && b.owner_title?.includes("Owner") && !b.owner_title?.includes("Co")) return 1
                if (a.is_owner && a.owner_title?.includes("Co-Owner")) return -1
                if (b.is_owner && b.owner_title?.includes("Co-Owner")) return 1
                if (a.is_captain) return -1
                if (b.is_captain) return 1
                return 0
              })
              .map((player) => (
                <Card
                  key={player.id}
                  className={`bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group ${
                    player.is_owner ? "ring-2 ring-amber-500/50" : ""
                  }`}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="relative">
                      <PlayerImage
                        src={player.image_url}
                        alt={player.name}
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl" />

                      {/* Owner badge */}
                      {player.is_owner && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xl transform -rotate-3 flex items-center gap-1 animate-pulse-slow">
                          <Crown className="w-3 h-3" />
                          {player.owner_title || "Owner"}
                        </div>
                      )}

                      {/* Captain badge */}
                      {player.is_captain && !player.is_owner && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xl transform -rotate-3 flex items-center gap-1">
                          <Flag className="w-3 h-3" />
                          Captain
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                        {player.name}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                          {player.role}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-white/70">{player.description}</p>
                    {/* Player Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs text-white/70 mt-2">
                      <div>
                        <span className="block font-bold text-white">{player.matches}</span>
                        <span className="block">Matches</span>
                      </div>
                      <div>
                        <span className="block font-bold text-white">{player.runs}</span>
                        <span className="block">Runs</span>
                      </div>
                      <div>
                        <span className="block font-bold text-white">{player.wickets}</span>
                        <span className="block">Wickets</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>

      {/* Management Section */}
      {management.length > 0 && (
        <section className="px-4 py-16 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Management & Support Staff</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {management.map((member) => (
                <Card
                  key={member.id}
                  className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <PlayerImage
                      src={member.image_url}
                      alt={member.name}
                      className="w-32 h-32 object-cover rounded-full mx-auto"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-white">{member.name}</h3>
                      <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30 mt-2">
                        {member.management_role || "Management"}
                      </Badge>
                    </div>
                    <p className="text-white/70 text-sm">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
