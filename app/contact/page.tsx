"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { SimpleNavigation } from "@/components/simple-navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, Clock, Facebook, Instagram, Twitter } from "lucide-react"

// Define types for dynamic content
interface ContactInfo {
  id: number
  type: string
  label: string
  value: string
  icon: string
  link: string
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

export default function ContactPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [heroSection, setHeroSection] = useState<Section | null>(null)
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([])
  const [formSection, setFormSection] = useState<Section | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  // Fetch dynamic content
  useEffect(() => {
    async function fetchContent() {
      try {
        // Fetch sections
        const sectionsResponse = await fetch("/api/sections?page=contact")
        if (!sectionsResponse.ok) {
          throw new Error("Failed to fetch sections")
        }
        const sectionsData = await sectionsResponse.json()

        // Set section data
        const hero = sectionsData.find((section: Section) => section.section_name === "hero")
        const form = sectionsData.find((section: Section) => section.section_name === "form")

        setHeroSection(hero || null)
        setFormSection(form || null)

        // Fetch contact info
        const contactResponse = await fetch("/api/contact-info")
        if (!contactResponse.ok) {
          throw new Error("Failed to fetch contact info")
        }
        const contactData = await contactResponse.json()
        setContactInfo(contactData)
      } catch (err: any) {
        setError(err.message)
        console.error("Error fetching content:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, you would send this data to a backend API
    console.log("Form submitted:", formData)
    alert("Thank you for your message! We will get back to you soon.")
    setFormData({ name: "", email: "", subject: "", message: "" }) // Clear form
  }

  // Map icon string to Lucide icon component
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Mail":
        return Mail
      case "Phone":
        return Phone
      case "MapPin":
        return MapPin
      case "Clock":
        return Clock
      case "Facebook":
        return Facebook
      case "Instagram":
        return Instagram
      case "Twitter":
        return Twitter
      default:
        return Mail
    }
  }

  // Group contact info by type
  const groupedContactInfo = contactInfo.reduce(
    (acc, info) => {
      if (!acc[info.type]) {
        acc[info.type] = []
      }
      acc[info.type].push(info)
      return acc
    },
    {} as Record<string, ContactInfo[]>,
  )

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white">
      <SimpleNavigation />

      {/* Hero Section */}
      <section className="px-4 py-10 pt-40">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <h1 className="text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">
            {heroSection?.title || "Contact Us"}
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            {heroSection?.content || "Have questions, suggestions, or want to join the team? Reach out to us!"}
          </p>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(groupedContactInfo)
              .filter(([type]) => type !== "social") // Remove social media cards
              .map(([type, infos]) => {
                const primaryInfo = infos[0]
                if (!primaryInfo) return null

                const IconComponent = getIconComponent(primaryInfo.icon)

                return (
                  <Card
                    key={type}
                    className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{primaryInfo.label}</h3>
                      {infos.map((info) => (
                        <p key={info.id} className="text-white/70 text-sm">
                          {info.link ? (
                            <a href={info.link} className="hover:text-amber-400 transition-colors">
                              {info.value}
                            </a>
                          ) : (
                            info.value
                          )}
                        </p>
                      ))}
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
