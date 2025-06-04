"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Target, Heart, MapPin, Calendar, Clock, Award } from "lucide-react"
import Image from "next/image"
import { SimpleNavigation } from "@/components/simple-navigation"
import { Footer } from "@/components/footer"

// Define types for our dynamic content
interface AboutContent {
  id: number
  section_type: string
  title: string
  content: string
  image_url: string
  icon: string
  is_active: boolean
  sort_order: number
}

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
  is_active: boolean
  sort_order: number
}

interface TeamInfo {
  home_ground: string
  founded_year: number
  training_schedule: string
  team_size: number
}

export default function AboutPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [heroSection, setHeroSection] = useState<Section | null>(null)
  const [missionContent, setMissionContent] = useState<AboutContent | null>(null)
  const [visionContent, setVisionContent] = useState<AboutContent | null>(null)
  const [values, setValues] = useState<AboutContent[]>([])
  const [teamInfoSection, setTeamInfoSection] = useState<Section | null>(null)
  const [teamInfoDetails, setTeamInfoDetails] = useState<TeamInfo | null>(null)

  // Fetch dynamic content
  useEffect(() => {
    async function fetchContent() {
      try {
        // Fetch sections
        const sectionsResponse = await fetch("/api/sections?page=about")
        if (!sectionsResponse.ok) {
          throw new Error("Failed to fetch sections")
        }
        const sectionsData = await sectionsResponse.json()

        // Set section data
        const hero = sectionsData.find((section: Section) => section.section_name === "hero")
        const team = sectionsData.find((section: Section) => section.section_name === "team_info")

        setHeroSection(hero || null)
        setTeamInfoSection(team || null)

        // Fetch about content
        const aboutResponse = await fetch("/api/about-content")
        if (!aboutResponse.ok) {
          throw new Error("Failed to fetch about content")
        }
        const aboutData = await aboutResponse.json()

        // Set about content data
        const mission = aboutData.find((content: AboutContent) => content.section_type === "mission")
        const vision = aboutData.find((content: AboutContent) => content.section_type === "vision")
        const valuesData = aboutData.filter((content: AboutContent) => content.section_type === "values")

        setMissionContent(mission || null)
        setVisionContent(vision || null)
        setValues(valuesData || [])

        // Fetch team info details
        const teamInfoResponse = await fetch("/api/team-info")
        if (teamInfoResponse.ok) {
          const teamInfoData = await teamInfoResponse.json()
          setTeamInfoDetails(teamInfoData[0] || null) // Get the first (most recent) team info entry
        }
      } catch (err: any) {
        setError(err.message)
        console.error("Error fetching content:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  // Default values if no data is fetched
  const defaultValues = [
    {
      icon: "Heart",
      title: "Passion",
      description: "We play with heart and dedication, bringing our love for cricket to every match.",
    },
    {
      icon: "Users",
      title: "Team Spirit",
      description: "Unity and camaraderie are the foundation of our success both on and off the field.",
    },
    {
      icon: "Target",
      title: "Excellence",
      description: "We strive for continuous improvement and excellence in all aspects of the game.",
    },
    {
      icon: "Award",
      title: "Sportsmanship",
      description: "We compete with honor, respect our opponents, and uphold the spirit of cricket.",
    },
  ]

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
            <button
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Map icon string to Lucide icon component
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Heart":
        return Heart
      case "Users":
        return Users
      case "Target":
        return Target
      case "Award":
        return Award
      case "Trophy":
        return Trophy
      default:
        return Heart
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white">
      {/* Simple Navigation */}
      <SimpleNavigation />

      {/* Hero Section */}
      <section className="px-4 py-20 pt-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">About Us</Badge>
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                {heroSection?.title ? (
                  <div dangerouslySetInnerHTML={{ __html: heroSection.title }} />
                ) : (
                  <>
                    The Story of
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">
                      Frankfurter Rebels
                    </span>
                  </>
                )}
              </h1>
              <p className="text-xl text-white/80">
                {heroSection?.content ||
                  "Born from a shared passion for cricket and a desire to promote the sport in Germany, the Frankfurter Rebels represent the spirit of determination, excellence, and unity."}
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-red-500/20 rounded-3xl blur-3xl" />
              <Image
                src={heroSection?.image_url || "/placeholder.svg?height=500&width=600"}
                alt="Team Formation"
                width={600}
                height={500}
                className="relative z-10 rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="px-4 py-16 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-red-600 rounded-2xl flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">{missionContent?.title || "Our Mission"}</h2>
                <p className="text-white/70">
                  {missionContent?.content ||
                    "To promote and develop cricket in Germany by providing a platform for players of all skill levels to learn, compete, and excel. We aim to build a strong cricket community in Frankfurt while maintaining the highest standards of sportsmanship and team spirit."}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-red-600 rounded-2xl flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">{visionContent?.title || "Our Vision"}</h2>
                <p className="text-white/70">
                  {visionContent?.content ||
                    "To become one of the leading cricket teams in Germany, inspiring the next generation of cricketers and contributing to the growth of cricket as a popular sport in the country. We envision a future where cricket thrives in German sporting culture."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">
              Our Values
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              The principles that guide us both on and off the cricket field.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(values.length > 0 ? values : defaultValues).map((value, index) => {
              const IconComponent = typeof value.icon === "string" ? getIconComponent(value.icon) : value.icon

              return (
                <Card
                  key={index}
                  className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{value.title}</h3>
                    <p className="text-white/70 text-sm">{value.description || value.content}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Information */}
      <section className="px-4 py-16 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">
                {teamInfoSection?.title || "Team Information"}
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-6 h-6 text-amber-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Home Ground</h3>
                    <p className="text-white/70">
                      {teamInfoDetails?.home_ground || "Frankfurt Cricket Ground, Hessen, Germany"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-6 h-6 text-amber-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Founded</h3>
                    <p className="text-white/70">{teamInfoDetails?.founded_year || "2025"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-amber-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Training Schedule</h3>
                    <p className="text-white/70">
                      {teamInfoDetails?.training_schedule || "Tuesday & Thursday evenings, Weekend matches"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-amber-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Team Size</h3>
                    <p className="text-white/70">{teamInfoDetails?.team_size || "15 active players + support staff"}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <Image
                src={teamInfoSection?.image_url || "/placeholder.svg?height=400&width=500"}
                alt="Training Session"
                width={500}
                height={400}
                className="rounded-3xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
