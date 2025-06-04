import { createServerSupabaseClient } from "@/lib/supabase"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Flag } from "lucide-react"

async function getHomePageSections() {
  const supabase = createServerSupabaseClient()

  const { data: sections } = await supabase
    .from("sections")
    .select("*")
    .eq("page", "home")
    .eq("is_active", true)
    .order("sort_order")

  return sections || []
}

async function getHomePageTeamMembers() {
  const supabase = createServerSupabaseClient()

  try {
    // Get first 6 players from the database in order (by creation date)
    const { data: players, error } = await supabase
      .from("players")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(6)

    console.log("Home page players fetched:", players?.length || 0)
    console.log("Players data:", players)

    if (error) {
      console.error("Error fetching players:", error)
      return []
    }

    return players || []
  } catch (error) {
    console.error("Error in getHomePageTeamMembers:", error)
    return []
  }
}

export default async function HomePage() {
  const sections = await getHomePageSections()
  const teamMembers = await getHomePageTeamMembers()

  // Get specific sections
  const heroSection = sections.find((s) => s.section_name === "hero")
  const aboutSection = sections.find((s) => s.section_name === "about")
  const teamSection = sections.find((s) => s.section_name === "team")
  const ctaSection = sections.find((s) => s.section_name === "cta")

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white">
      <Navigation />

      {/* Hero Section */}
      {heroSection && (
        <section className="relative min-h-screen flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <Image
              src={heroSection.image_url || "/cricket-banner-final.jpeg"}
              alt="Cricket Banner"
              fill
              className="object-cover opacity-40"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black" />
          </div>
          <div className="relative z-10 text-center max-w-4xl mx-auto px-4 pt-20">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              {heroSection.title || "Frankfurter Rebels Cricket Team"}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-white/80">
              {heroSection.content || "Join us in our journey to cricket excellence in Frankfurt, Germany."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {heroSection.button_text && (
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white border-0"
                >
                  <Link href={heroSection.button_link || "#"}>{heroSection.button_text}</Link>
                </Button>
              )}
              {heroSection.button_text_secondary && (
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Link href={heroSection.button_link_secondary || "#"}>{heroSection.button_text_secondary}</Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      {aboutSection && (
        <section className="py-20 bg-black/40 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">
                {aboutSection.title || "About Our Team"}
              </h2>
              <p className="text-lg text-white/70 mb-8">
                {aboutSection.content ||
                  "Founded with passion and determination, Frankfurter Rebels is more than just a cricket team - we're a family united by our love for the game."}
              </p>
              {aboutSection.button_text && (
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white border-0"
                >
                  <Link href={aboutSection.button_link || "/about"}>{aboutSection.button_text}</Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Team Section - Show first 6 players */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">
              {teamSection?.title || "Meet Our Team"}
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              {teamSection?.content ||
                "The talented individuals who make up the Frankfurter Rebels. Each player brings unique skills and passion to our team."}
            </p>
            <div className="mt-4 text-amber-400 text-sm">
              Showing {Math.min(teamMembers.length, 6)} of {teamMembers.length} team members
            </div>
          </div>

          {teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {teamMembers.map((member, index) => (
                <Card
                  key={member.id}
                  className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group"
                >
                  <CardContent className="p-6">
                    <div className="relative mb-4">
                      <Image
                        src={member.image_url || "/placeholder.svg?height=200&width=200&query=team member"}
                        alt={member.name}
                        width={200}
                        height={200}
                        className="rounded-full mx-auto object-cover h-48 w-48"
                      />
                      {member.is_owner && (
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xl transform -rotate-3 flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          {member.owner_title || "Team Owner"}
                        </div>
                      )}
                      {member.is_captain && !member.is_owner && (
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xl transform -rotate-3 flex items-center gap-1">
                          <Flag className="w-3 h-3" />
                          Captain
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-amber-400 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-white/70 mb-2">{member.role}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                        {member.experience || "Player"}
                      </Badge>
                      <Badge variant="outline" className="border-white/20 text-white/60 text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                    {member.description && <p className="text-sm text-white/60 line-clamp-3">{member.description}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white/5 backdrop-blur-sm border-white/10 rounded-2xl p-8 max-w-md mx-auto">
                <h3 className="text-xl font-bold text-white mb-4">No Team Members Found</h3>
                <p className="text-white/70 mb-6">
                  No players have been added to the database yet. Please add team members through the admin panel.
                </p>
                <Button className="bg-amber-600 hover:bg-amber-700">
                  <Link href="/cricket/players">Add Players</Link>
                </Button>
              </div>
            </div>
          )}

          {teamSection?.button_text && teamMembers.length > 0 && (
            <div className="text-center mt-12">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white border-0"
              >
                <Link href={teamSection.button_link || "/team"}>{teamSection.button_text}</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {ctaSection && (
        <section className="py-20 bg-gradient-to-r from-amber-500/20 to-red-600/20 backdrop-blur-sm">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">{ctaSection.title || "Join the Frankfurter Rebels"}</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-white/80">
              {ctaSection.content ||
                "Whether you're an experienced player or new to cricket, we welcome passionate individuals to join our team."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {ctaSection.button_text && (
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white border-0"
                >
                  <Link href={ctaSection.button_link || "/contact"}>{ctaSection.button_text}</Link>
                </Button>
              )}
              {ctaSection.button_text_secondary && (
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Link href={ctaSection.button_link_secondary || "#"}>{ctaSection.button_text_secondary}</Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
