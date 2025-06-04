"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { X } from "lucide-react"
import { SimpleNavigation } from "@/components/simple-navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"

interface GalleryImage {
  id: number
  title: string
  description: string
  image_url: string
  category: string
  is_active: boolean
  created_at: string
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
  button_text_secondary: string
  button_link_secondary: string
  is_active: boolean
  sort_order: number
}

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [callToActionSection, setCallToActionSection] = useState<Section | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGalleryData() {
      try {
        // Fetch gallery images using the API route
        const imagesResponse = await fetch("/api/gallery")
        if (!imagesResponse.ok) {
          throw new Error(`Failed to fetch gallery images: ${imagesResponse.status}`)
        }
        const imagesData = await imagesResponse.json()

        // Filter for active images and sort by created_at
        const activeImages = imagesData
          .filter((img: GalleryImage) => img.is_active === true)
          .sort(
            (a: GalleryImage, b: GalleryImage) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
          )

        setGalleryImages(activeImages)

        // Fetch sections for call-to-action
        try {
          const sectionsResponse = await fetch("/api/sections?page=gallery")
          if (sectionsResponse.ok) {
            const sectionsData = await sectionsResponse.json()
            const ctaSection = sectionsData.find((section: Section) => section.section_name === "gallery-cta")
            setCallToActionSection(ctaSection || null)
          }
        } catch (sectionError) {
          console.warn("Failed to fetch gallery sections:", sectionError)
        }
      } catch (err: any) {
        setError(err.message)
        console.error("Gallery fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchGalleryData()
  }, [])

  // Group images by category
  const groupedImages = galleryImages.reduce(
    (acc, image) => {
      const category = image.category || "Uncategorized"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(image)
      return acc
    },
    {} as Record<string, GalleryImage[]>,
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white">
        <SimpleNavigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mr-2"></div>
          <span>Loading gallery...</span>
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
            <h2 className="text-xl font-bold mb-4">Error Loading Gallery</h2>
            <p className="text-sm text-gray-300 mb-4">{error}</p>
            <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white">
      <SimpleNavigation />

      {/* Hero Section */}
      <section className="px-4 py-20 pt-32">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <h1 className="text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">
            Gallery
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Capturing the moments that define our journey - from intense training sessions to memorable victories and
            team celebrations.
          </p>
        </div>
      </section>

      {/* Gallery Content */}
      {Object.keys(groupedImages).length > 0 ? (
        Object.entries(groupedImages).map(([category, images], categoryIndex) => (
          <section key={categoryIndex} className="px-4 py-16">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">{category}</h2>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">{images.length} Photos</Badge>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images.map((image) => (
                  <Card
                    key={image.id}
                    className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                    onClick={() => setSelectedImage(image.image_url)}
                  >
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden rounded-lg">
                        <Image
                          src={image.image_url || "/placeholder.svg"}
                          alt={image.title}
                          width={600}
                          height={400}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            console.error("Image failed to load:", image.image_url)
                            e.currentTarget.src = "/placeholder.svg"
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-sm font-medium">{image.title}</p>
                          {image.description && <p className="text-xs text-gray-300 mt-1">{image.description}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        ))
      ) : (
        <section className="px-4 py-16">
          <div className="max-w-7xl mx-auto text-center">
            <div className="bg-white/5 backdrop-blur-sm border-white/10 rounded-2xl p-12">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Gallery Coming Soon</h3>
              <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                We're currently building our gallery to showcase the amazing moments from our cricket journey. Check
                back soon to see our training sessions, matches, and team celebrations!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white border-0"
                >
                  <Link href="/contact">Join Our Team</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Link href="/about">Learn About Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-12 right-0 text-white hover:text-amber-400"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </Button>
            <Image
              src={selectedImage || "/placeholder.svg"}
              alt="Gallery image"
              width={800}
              height={600}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Call to Action */}
      <section className="px-4 py-16 bg-black/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">
            {callToActionSection?.title || "Want to be Part of Our Story?"}
          </h2>
          <p className="text-xl text-white/70">
            {callToActionSection?.content ||
              "Join the Frankfurter Rebels and create memories that will last a lifetime."}
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white border-0"
          >
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
