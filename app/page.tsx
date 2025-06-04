"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Trophy, Star, Shield, ChevronRight, Crown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { SimpleNavigation } from "@/components/simple-navigation"
import { Footer } from "@/components/footer"

// Define types for our dynamic content
interface Section {
  id: number
  page: string
  section_name: string
  title: string
  subtitle: string
  content: string
  image_url: string
  button_text: string
  button_link: string
  button_text_secondary: string
  button_link_secondary: string
  is_active: boolean
  sort_order: number
}

interface TeamStat {
  id: number
  label: string
  value: string
  icon: string
  description: string
}

interface Player {
  id: number
  name: string
  role: string
  image_url: string
  description: string
  is_owner: boolean
  owner_title: string
  matches: number
  runs: number
  wickets: number
}

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)
  const [activeSection, setActiveSection] = useState(0)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)

  // State for dynamic content
  const [heroSection, setHeroSection] = useState<Section | null>(null)
  const [teamSection, setTeamSection] = useState<Section | null>(null)
  const [statsSection, setStatsSection] = useState<Section | null>(null)
  const [joinSection, setJoinSection] = useState<Section | null>(null)
  const [teamStats, setTeamStats] = useState<TeamStat[]>([])
  const [teamMembers, setTeamMembers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth)
    }
  }, [])

  // Fetch dynamic content
  useEffect(() => {
    async function fetchContent() {
      try {
        // Fetch sections
        const sectionsResponse = await fetch("/api/sections?page=home")
        if (!sectionsResponse.ok) {
          throw new Error("Failed to fetch sections")
        }
        const sectionsData = await sectionsResponse.json()

        // Set section data
        const hero = sectionsData.find((section: Section) => section.section_name === "hero")
        const team = sectionsData.find((section: Section) => section.section_name === "team")
        const stats = sectionsData.find((section: Section) => section.section_name === "stats")
        const join = sectionsData.find((section: Section) => section.section_name === "join")

        setHeroSection(hero || null)
        setTeamSection(team || null)
        setStatsSection(stats || null)
        setJoinSection(join || null)

        // Fetch team stats
        const statsResponse = await fetch("/api/team-stats")
        if (!statsResponse.ok) {
          throw new Error("Failed to fetch team stats")
        }
        const statsData = await statsResponse.json()
        setTeamStats(statsData)

        // Fetch featured players
        const playersResponse = await fetch("/api/players?featured=true")
        if (!playersResponse.ok) {
          throw new Error("Failed to fetch players")
        }
        const playersData = await playersResponse.json()
        setTeamMembers(playersData)
      } catch (err: any) {
        setError(err.message)
        console.error("Error fetching content:", err)
      } finally {
        setLoading(false)
      }
    }

    if (isClient) {
      fetchContent()
    }
  }, [isClient])

  // Handle scroll for parallax effects
  useEffect(() => {
    if (!isClient || typeof window === "undefined") return

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isClient])

  // Handle window resize
  useEffect(() => {
    if (!isClient || typeof window === "undefined") return

    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isClient])

  // Navigation dots
  const sections = ["Home", "Team", "Stats", "Join"]

  // Helper function for safe window operations
  const safeScrollTo = (top: number) => {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top,
        behavior: "smooth",
      })
    }
  }

  // Helper function to check if desktop
  const isDesktop = windowWidth >= 1024

  // Helper function to get transform styles safely
  const getParallaxTransform = (factor: number) => {
    return isClient && isDesktop ? `translateY(${scrollY * factor}px)` : "none"
  }

  // Don't render complex animations on server
  if (!isClient) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <SimpleNavigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mr-2"></div>
          <span>Loading content...</span>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <SimpleNavigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-md p-6 bg-red-900/20 rounded-lg border border-red-500/20">
            <h2 className="text-xl font-bold mb-4">Error Loading Content</h2>
            <p>{error}</p>
            <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Simple Navigation (matches team page header) */}
      <SimpleNavigation />

      {/* Navigation Dots - Hidden on mobile */}
      <div className="fixed right-4 lg:right-8 top-1/2 transform -translate-y-1/2 z-50 hidden md:flex flex-col gap-4">
        {sections.map((section, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              activeSection === index ? "bg-amber-500 w-12" : "bg-white/30 hover:bg-white/50"
            }`}
            onClick={() => {
              setActiveSection(index)
              safeScrollTo(index * (typeof window !== "undefined" ? window.innerHeight : 800))
            }}
            aria-label={`Scroll to ${section}`}
          />
        ))}
      </div>

      {/* Hero Section - Fully Responsive */}
      <section className="relative min-h-screen flex items-center px-4 lg:px-8 py-20 lg:py-32 pt-24">
        {/* Background Elements - Simplified for mobile */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Cricket field lines */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/10" />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 lg:w-40 lg:h-40 rounded-full border border-white/10 transform -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 lg:w-80 lg:h-80 rounded-full border border-white/10 transform -translate-x-1/2 -translate-y-1/2" />

          {/* Animated cricket ball - Desktop only */}
          {isDesktop && (
            <div
              className="absolute w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-red-600"
              style={{
                boxShadow: "0 0 20px 5px rgba(239, 68, 68, 0.3)",
                animation: "cricketBall 15s infinite linear",
                left: `${50 + Math.sin(scrollY / 200) * 40}%`,
                top: `${30 + Math.cos(scrollY / 200) * 20}%`,
              }}
            >
              <div className="absolute inset-0 rounded-full border-2 border-red-300/30" />
            </div>
          )}

          {/* Animated cricket stumps - Desktop only */}
          {isDesktop && (
            <div className="absolute bottom-0 left-1/4 h-32 lg:h-40 w-16 lg:w-20 justify-between flex">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 bg-gradient-to-t from-amber-600 to-amber-400"
                  style={{
                    height: `${120 + Math.sin(scrollY / 100 + i) * 10}px`,
                    boxShadow: "0 0 10px rgba(245, 158, 11, 0.5)",
                  }}
                />
              ))}
            </div>
          )}
        </div>
        {/* Content */}
        <div className="container mx-auto px-4 z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="w-full lg:w-1/2 lg:pr-12 space-y-4 md:space-y-6 lg:space-y-8 text-center lg:text-left">
            <div className="space-y-3 md:space-y-4">
              <Badge className="px-2 py-1 md:px-3 md:py-1 lg:px-4 lg:py-1.5 text-xs md:text-sm bg-gradient-to-r from-amber-500 to-red-500 border-0 shadow-lg shadow-amber-500/20">
                {heroSection?.subtitle || "EST. 2025 • FRANKFURT"}
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                {heroSection?.title ? (
                  <div dangerouslySetInnerHTML={{ __html: heroSection.title }} />
                ) : (
                  <>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">
                      STRIKE
                    </span>
                    <span className="block">WITH</span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">
                      STYLE
                    </span>
                  </>
                )}
              </h1>
            </div>

            <p className="text-base md:text-lg lg:text-xl text-gray-300 max-w-lg mx-auto lg:mx-0">
              {heroSection?.content ||
                "Where explosive talent meets precision cricket. Join the Frankfurter Rebels and paint your legacy on the field."}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 border-0 rounded-full px-4 md:px-6 lg:px-8 py-3 md:py-4 text-sm md:text-base shadow-lg shadow-amber-500/20 transform hover:scale-105 transition-all duration-300"
                onClick={() =>
                  window.open(heroSection?.button_link || "https://facebook.com/frankfurterrebels", "_blank")
                }
              >
                {heroSection?.button_text || "FOLLOW ON FACEBOOK"}
              </Button>
              <Link href={heroSection?.button_link_secondary || "/team"}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-amber-500/20 hover:border-amber-500/50 hover:text-amber-300 rounded-full px-4 md:px-6 lg:px-8 py-3 md:py-4 text-sm md:text-base transform hover:scale-105 transition-all duration-300"
                >
                  {heroSection?.button_text_secondary || "MEET THE TEAM"}
                </Button>
              </Link>
            </div>
          </div>

          <div
            className="w-full lg:w-1/2 relative mt-8 lg:mt-0"
            style={{
              transform: getParallaxTransform(-0.05),
            }}
          >
            {/* Main cricket banner image with responsive animations */}
            <div className="relative group cursor-pointer">
              {/* Animated background rings - Desktop only */}
              {isDesktop && (
                <div className="absolute inset-0 -z-10">
                  <div className="absolute top-1/2 left-1/2 w-72 h-72 md:w-96 md:h-96 border border-amber-500/20 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-spin-slow" />
                  <div className="absolute top-1/2 left-1/2 w-60 h-60 md:w-80 md:h-80 border border-red-500/20 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-spin-reverse" />
                  <div className="absolute top-1/2 left-1/2 w-48 h-48 md:w-64 md:h-64 border border-orange-500/20 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
              )}

              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-red-500/20 rounded-full blur-2xl md:blur-3xl scale-110 md:scale-150 animate-pulse-glow" />

              {/* Cricket banner image - Fully responsive */}
              <div
                className={`relative z-10 transition-all duration-1000 ${
                  isImageLoaded ? "animate-banner-entrance" : "opacity-0 scale-95"
                }`}
                style={{
                  background: "radial-gradient(circle, transparent 30%, rgba(0,0,0,0.1) 70%)",
                  borderRadius: "50%",
                }}
              >
                <div className="relative overflow-hidden rounded-full">
                  <Image
                    src={heroSection?.image_url || "/cricket-banner-new-style.png"}
                    alt="Cricket Player in Action"
                    width={600}
                    height={600}
                    className="w-full h-auto max-w-[280px] md:max-w-[400px] lg:max-w-[500px] xl:max-w-[600px] mx-auto object-contain drop-shadow-2xl animate-float-banner group-hover:animate-swing-bat transition-all duration-500 group-hover:scale-105"
                    style={{
                      mixBlendMode: "screen",
                      filter: "contrast(1.2) brightness(1.1) saturate(1.1)",
                    }}
                    onLoad={() => setIsImageLoaded(true)}
                    priority
                  />

                  {/* Animated energy particles - Desktop only */}
                  {isDesktop && (
                    <div className="absolute inset-0 pointer-events-none">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1.5 h-1.5 md:w-2 md:h-2 bg-amber-400 rounded-full animate-energy-particle opacity-70"
                          style={{
                            left: `${20 + i * 12}%`,
                            top: `${30 + i * 8}%`,
                            animationDelay: `${i * 0.3}s`,
                            animationDuration: `${2 + i * 0.2}s`,
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Animated cricket trail effect - Desktop only */}
                  {isDesktop && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-1/4 right-1/4 w-24 md:w-32 h-0.5 md:h-1 bg-gradient-to-r from-amber-500 to-transparent rounded-full animate-trail-effect opacity-60" />
                      <div className="absolute top-1/3 right-1/3 w-16 md:w-24 h-0.5 md:h-1 bg-gradient-to-r from-red-500 to-transparent rounded-full animate-trail-effect-delayed opacity-40" />
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced decorative elements - Responsive */}
              {isDesktop && (
                <>
                  <div className="absolute -top-6 -right-6 md:-top-10 md:-right-10 w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-amber-500/30 to-red-500/30 blur-xl md:blur-2xl animate-pulse-slow" />
                  <div
                    className="absolute -bottom-6 -left-6 md:-bottom-10 md:-left-10 w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 blur-xl md:blur-2xl animate-pulse-slow"
                    style={{
                      animationDelay: "1s",
                    }}
                  />

                  {/* Enhanced floating cricket elements - Responsive */}
                  <div
                    className="absolute top-16 right-16 md:top-20 md:right-20 w-4 h-4 md:w-6 md:h-6 rounded-full bg-red-600 shadow-lg shadow-red-600/50 animate-cricket-ball-float"
                    style={{
                      animationDelay: "0.5s",
                    }}
                  />
                  <div
                    className="absolute bottom-16 left-16 md:bottom-20 md:left-20 w-3 h-3 md:w-4 md:h-4 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50 animate-cricket-ball-float"
                    style={{
                      animationDelay: "1.5s",
                    }}
                  />
                  <div
                    className="absolute top-1/2 left-6 md:left-10 w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-cricket-ball-float"
                    style={{
                      animationDelay: "2.5s",
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
        {/* Scroll indicator - Desktop only */}
        {isDesktop && (
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
            <span className="text-sm text-gray-400 mb-2">SCROLL</span>
            <ChevronRight className="w-6 h-6 text-amber-500 transform rotate-90" />
          </div>
        )}
      </section>

      {/* Team Section - Responsive */}
      <section className="relative min-h-screen flex items-center py-10 lg:py-20 px-4 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          {/* Background pattern - Simplified for mobile */}
          <div className="absolute inset-0 opacity-5">
            {Array.from({ length: isDesktop ? 20 : 10 }).map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl lg:text-6xl font-bold text-white"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: 0.1,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              >
                REBELS
              </div>
            ))}
          </div>

          {/* Cricket bat silhouette - Desktop only */}
          {isDesktop && (
            <div
              className="absolute top-1/4 right-10 w-20 h-96 bg-amber-500/10 rounded-t-full rounded-b-sm transform -rotate-12"
              style={{
                transform: `rotate(${-12 + Math.sin(scrollY / 500) * 5}deg)`,
              }}
            />
          )}
        </div>

        <div className="container mx-auto px-4 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 lg:mb-16 space-y-4 text-center lg:text-left">
              <h2 className="text-4xl lg:text-6xl font-bold">
                {teamSection?.title ? (
                  <div dangerouslySetInnerHTML={{ __html: teamSection.title }} />
                ) : (
                  <>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">
                      MEET
                    </span>{" "}
                    THE REBELS
                  </>
                )}
              </h2>
              <p className="text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto lg:mx-0">
                {teamSection?.content ||
                  "Our team consists of passionate cricketers who bring their unique skills and energy to every match."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {teamMembers
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
                .slice(0, 6)
                .map((player, index) => (
                  <div
                    key={player.id}
                    className={`group relative overflow-hidden ${
                      player.is_owner ? "ring-2 ring-amber-500/50 rounded-xl" : ""
                    }`}
                    style={{
                      transform: isDesktop
                        ? `translateY(${Math.max(0, (scrollY - 700 - index * 50) * 0.1)}px)`
                        : "none",
                    }}
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-gray-900 rounded-xl">
                      <Image
                        src={player.image_url || "/placeholder.svg"}
                        alt={player.name}
                        width={300}
                        height={400}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 lg:p-6 rounded-xl">
                      {/* Owner/Captain badge */}
                      {player.is_owner && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xl transform -rotate-3 flex items-center gap-1 animate-pulse-slow">
                          <Crown className="w-3 h-3" />
                          {player.owner_title}
                        </div>
                      )}
                      {player.is_captain && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xl transform rotate-3 flex items-center gap-1 animate-pulse-slow">
                          <Shield className="w-3 h-3" />
                          Captain
                        </div>
                      )}

                      <h3 className="text-xl lg:text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">
                        {player.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge
                          variant="secondary"
                          className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs"
                        >
                          {player.role}
                        </Badge>
                      </div>

                      <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-4 transition-all duration-300">
                        <p className="text-gray-300 text-sm mb-2">{player.description}</p>
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
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="mt-8 lg:mt-12 text-center">
              <Link href="/team">
                <Button size="lg" className="bg-white text-black hover:bg-amber-100 rounded-full px-6 lg:px-8">
                  {teamSection?.button_text || "VIEW ALL PLAYERS"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Responsive */}
      <section className="relative min-h-screen flex items-center py-10 lg:py-20 overflow-hidden px-4 lg:px-8">
        <div className="absolute inset-0">
          {/* Dynamic background */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-red-900/20"
            style={{
              backgroundPosition: isDesktop ? `${0}px ${0}px` : "center",
            }}
          />

          {/* Cricket field overlay */}
          <div className="absolute inset-0 border-2 lg:border-4 border-white/5 m-10 lg:m-20 rounded-full" />
          <div className="absolute inset-0 border border-white/5 m-20 lg:m-40 rounded-full" />

          {/* Animated cricket balls - Desktop only */}
          {isDesktop &&
            [1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="absolute w-4 h-4 rounded-full bg-red-600/30"
                style={{
                  left: `${(i * 20) % 100}%`,
                  top: `${(i * 15) % 100}%`,
                  animation: `floatingBall ${3 + i}s infinite ease-in-out alternate`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
        </div>

        <div className="container mx-auto px-4 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 lg:mb-16 space-y-4 text-center">
              <h2 className="text-4xl lg:text-6xl font-bold">
                {statsSection?.title ? (
                  <div dangerouslySetInnerHTML={{ __html: statsSection.title }} />
                ) : (
                  <>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">
                      TEAM
                    </span>{" "}
                    STATS
                  </>
                )}
              </h2>
              <p className="text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto">
                {statsSection?.content ||
                  "Our achievements speak for themselves. Here's what we've accomplished so far."}
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
              {teamStats.length > 0
                ? teamStats.map((stat, index) => {
                    // Map icon string to Lucide icon component
                    let IconComponent
                    switch (stat.icon) {
                      case "Trophy":
                        IconComponent = Trophy
                        break
                      case "Star":
                        IconComponent = Star
                        break
                      case "Users":
                        IconComponent = Users
                        break
                      case "Shield":
                        IconComponent = Shield
                        break
                      default:
                        IconComponent = Trophy
                    }

                    return (
                      <div
                        key={stat.id}
                        className="relative"
                        style={{
                          transform: isDesktop
                            ? `translateY(${Math.max(0, (scrollY - 1300 - index * 50) * 0.1)}px)`
                            : "none",
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-red-500/10 rounded-2xl transform rotate-3" />
                        <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl p-4 lg:p-8 text-center space-y-2 lg:space-y-4 hover:border-amber-500/30 transition-all duration-300">
                          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-amber-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto">
                            <IconComponent className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                          </div>
                          <div>
                            <div className="text-3xl lg:text-5xl font-bold text-white">{stat.value}</div>
                            <div className="text-amber-400 text-xs lg:text-sm uppercase tracking-wider mt-1 lg:mt-2">
                              {stat.label}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                : [
                    { label: "Matches", value: "45", icon: Trophy },
                    { label: "Wins", value: "32", icon: Star },
                    { label: "Players", value: "15", icon: Users },
                    { label: "Years", value: "1", icon: Shield },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="relative"
                      style={{
                        transform: isDesktop
                          ? `translateY(${Math.max(0, (scrollY - 1300 - index * 50) * 0.1)}px)`
                          : "none",
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-red-500/10 rounded-2xl transform rotate-3" />
                      <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl p-4 lg:p-8 text-center space-y-2 lg:space-y-4 hover:border-amber-500/30 transition-all duration-300">
                        <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-amber-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto">
                          <stat.icon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                        </div>
                        <div>
                          <div className="text-3xl lg:text-5xl font-bold text-white">{stat.value}</div>
                          <div className="text-amber-400 text-xs lg:text-sm uppercase tracking-wider mt-1 lg:mt-2">
                            {stat.label}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>

            {/* Animated cricket bat - Desktop only */}
            {isDesktop && (
              <div
                className="absolute bottom-20 right-20 w-20 h-96"
                style={{
                  transform: `rotate(${45 + Math.sin(scrollY / 300) * 10}deg)`,
                }}
              >
                <div className="w-full h-3/4 bg-gradient-to-b from-amber-700/20 to-amber-900/20 rounded-t-sm" />
                <div className="w-full h-1/4 bg-gradient-to-b from-amber-600/20 to-amber-800/20 rounded-b-full" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Join Section - Responsive */}
      <section className="relative min-h-screen flex items-center py-10 lg:py-20 px-4 lg:px-8">
        <div className="absolute inset-0">
          {/* Dynamic background */}
          <div className="absolute inset-0 bg-gradient-to-br from-black to-amber-950" />

          {/* Cricket field lines */}
          <div className="absolute top-0 left-0 right-0 h-px bg-amber-500/10" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-amber-500/10" />
          <div className="absolute top-0 bottom-0 left-0 w-px bg-amber-500/10" />
          <div className="absolute top-0 bottom-0 right-0 w-px bg-amber-500/10" />

          {/* Animated particles - Desktop only */}
          {isDesktop &&
            Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-amber-500/30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `floatingParticle ${5 + Math.random() * 10}s infinite ease-in-out alternate`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              />
            ))}
        </div>

        <div className="container mx-auto px-4 z-10">
          <div className="max-w-6xl mx-auto text-center space-y-6 lg:space-y-8">
            <h2 className="text-4xl lg:text-6xl font-bold">
              {joinSection?.title ? (
                <div dangerouslySetInnerHTML={{ __html: joinSection.title }} />
              ) : (
                <>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">JOIN</span>{" "}
                  THE REBELLION
                </>
              )}
            </h2>
            <p className="text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto">
              {joinSection?.content ||
                "Be part of something special. The Frankfurter Rebels are looking for passionate cricketers to join our ranks."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center mt-8 lg:mt-12">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 border-0 rounded-full px-6 lg:px-8 py-4 lg:py-6 text-base lg:text-lg shadow-lg shadow-amber-500/20"
                onClick={() =>
                  window.open(joinSection?.button_link || "https://facebook.com/frankfurterrebels", "_blank")
                }
              >
                {joinSection?.button_text || "FOLLOW ON FACEBOOK"}
              </Button>
              <Link href={joinSection?.button_link_secondary || "/team"}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-amber-500/20 hover:border-amber-500/50 hover:text-amber-300 rounded-full px-6 lg:px-8 py-4 lg:py-6 text-base lg:text-lg"
                >
                  {joinSection?.button_text_secondary || "MEET THE TEAM"}
                </Button>
              </Link>
            </div>
            {/* Team logo animation */}
            <div className="mt-12 lg:mt-20 relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/20 to-red-500/20 blur-3xl animate-pulse" />
              <Image
                src="/team-logo.png"
                alt="Frankfurter Rebels Logo"
                width={200}
                height={200}
                className="mx-auto relative z-10 w-32 h-32 lg:w-40 lg:h-40 animate-float"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Global styles for animations */}
      <style jsx global>{`
        @keyframes cricketBall {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(100px, 50px) rotate(90deg); }
          50% { transform: translate(0, 100px) rotate(180deg); }
          75% { transform: translate(-100px, 50px) rotate(270deg); }
          100% { transform: translate(0, 0) rotate(360deg); }
        }
        
        @keyframes floatingBall {
          0% { transform: translate(0, 0); }
          100% { transform: translate(20px, 20px); }
        }
        
        @keyframes floatingParticle {
          0% { transform: translate(0, 0); opacity: 0.3; }
          50% { opacity: 1; }
          100% { transform: translate(30px, 30px); opacity: 0.3; }
        }
        
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }

        /* New Banner Animations */
        @keyframes float-banner {
          0% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(1deg); }
          66% { transform: translateY(-4px) rotate(-0.5deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }

        @keyframes swing-bat {
          0% { transform: translateY(0) rotate(0deg) scale(1); }
          25% { transform: translateY(-5px) rotate(2deg) scale(1.02); }
          50% { transform: translateY(-8px) rotate(-1deg) scale(1.05); }
          75% { transform: translateY(-3px) rotate(1deg) scale(1.02); }
          100% { transform: translateY(0) rotate(0deg) scale(1); }
        }

        @keyframes banner-entrance {
          0% { 
            opacity: 0; 
            transform: scale(0.8) translateY(50px) rotate(-5deg); 
          }
          50% { 
            opacity: 0.7; 
            transform: scale(1.05) translateY(-10px) rotate(2deg); 
          }
          100% { 
            opacity: 1; 
            transform: scale(1) translateY(0) rotate(0deg); 
          }
        }

        @keyframes pulse-glow {
          0% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
          100% { opacity: 0.5; transform: scale(1); }
        }

        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes spin-reverse {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }

        @keyframes energy-particle {
          0% { 
            transform: translate(0, 0) scale(0.5); 
            opacity: 0; 
          }
          50% { 
            transform: translate(20px, -30px) scale(1); 
            opacity: 1; 
          }
          100% { 
            transform: translate(40px, -60px) scale(0.3); 
            opacity: 0; 
          }
        }

        @keyframes trail-effect {
          0% { 
            width: 0; 
            opacity: 0; 
          }
          50% { 
            width: 128px; 
            opacity: 1; 
          }
          100% { 
            width: 0; 
            opacity: 0; 
          }
        }

        @keyframes trail-effect-delayed {
          0% { 
            width: 0; 
            opacity: 0; 
          }
          30% { 
            width: 0; 
            opacity: 0; 
          }
          80% { 
            width: 96px; 
            opacity: 0.8; 
          }
          100% { 
            width: 0; 
            opacity: 0; 
          }
        }

        @keyframes cricket-ball-float {
          0% { 
            transform: translate(0, 0) scale(1); 
            box-shadow: 0 4px 8px rgba(0,0,0,0.3); 
          }
          50% { 
            transform: translate(10px, -15px) scale(1.1); 
            box-shadow: 0 8px 16px rgba(0,0,0,0.4); 
          }
          100% { 
            transform: translate(0, 0) scale(1); 
            box-shadow: 0 4px 8px rgba(0,0,0,0.3); 
          }
        }

        @keyframes pulse-slow {
          0% { opacity: 0.4; }
          50% { opacity: 0.8; }
          100% { opacity: 0.4; }
        }

        @keyframes impact-ripple {
          0% { 
            transform: translate(-50%, -50%) scale(0); 
            opacity: 1; 
          }
          100% { 
            transform: translate(-50%, -50%) scale(4); 
            opacity: 0; 
          }
        }

        @keyframes impact-ripple-delayed {
          0% { 
            transform: translate(-50%, -50%) scale(0); 
            opacity: 0.8; 
          }
          100% { 
            transform: translate(-50%, -50%) scale(6); 
            opacity: 0; 
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-banner {
          animation: float-banner 4s ease-in-out infinite;
        }

        .animate-swing-bat {
          animation: swing-bat 2s ease-in-out;
        }

        .animate-banner-entrance {
          animation: banner-entrance 1.5s ease-out forwards;
        }

        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 15s linear infinite;
        }

        .animate-energy-particle {
          animation: energy-particle 2s ease-out infinite;
        }

        .animate-trail-effect {
          animation: trail-effect 3s ease-in-out infinite;
        }

        .animate-trail-effect-delayed {
          animation: trail-effect-delayed 3s ease-in-out infinite;
        }

        .animate-cricket-ball-float {
          animation: cricket-ball-float 3s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-impact-ripple {
          animation: impact-ripple 0.6s ease-out;
        }

        .animate-impact-ripple-delayed {
          animation: impact-ripple-delayed 0.8s ease-out 0.2s;
        }
        
        html {
          scroll-behavior: smooth;
        }
      `}</style>
      <Footer />
    </div>
  )
}
