"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Search, Filter, Star, Users, Award, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

interface Doctor {
  id: string
  full_name: string
  email_address: string
  phone_number?: string
  specialization: string
  license_number: string
  qualifications?: string
  bio?: string
  years_of_experience?: number
  consultation_fee?: number
  profile_image_url?: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

export default function ProvidersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
  const [selectedAvailability, setSelectedAvailability] = useState<string | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.getDoctors({ is_active: true })
        setDoctors(response.data || [])
      } catch (err) {
        console.error('Error fetching doctors:', err)
        setError(err instanceof Error ? err.message : 'Failed to load doctors')
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  // Get unique specialties from doctors
  const specialties = Array.from(new Set(doctors.map(d => d.specialization).filter(Boolean)))

  const filteredProviders = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doctor.bio && doctor.bio.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesSpecialty = !selectedSpecialty || doctor.specialization === selectedSpecialty
    return matchesSearch && matchesSpecialty
  })

  // Helper function to get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  // Helper function to format experience
  const formatExperience = (years?: number) => {
    if (!years) return "Experience not specified"
    return `${years} ${years === 1 ? 'year' : 'years'} experience`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-foreground">Loading doctors...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Card>
      </div>
    )
  }
    {
      id: "emily-chen",
      name: "Dr. Emily Chen",
      specialty: "Anxiety & Stress",
      bio: "Specializing in cognitive behavioral therapy for anxiety disorders",
      rating: 4.9,
      reviews: 128,
      patients: 450,
      availability: "Available Today",
      experience: "12 years",
      languages: ["English", "Mandarin"],
      image: "EC",
    },
    {
      id: "michael-rodriguez",
      name: "Dr. Michael Rodriguez",
      specialty: "Depression Support",
      bio: "Expert in treating depression and mood disorders",
      rating: 4.8,
      reviews: 95,
      patients: 380,
      availability: "Available Tomorrow",
      experience: "10 years",
      languages: ["English", "Spanish"],
      image: "MR",
    },
    {
      id: "sarah-williams",
      name: "Dr. Sarah Williams",
      specialty: "Relationship Counseling",
      bio: "Couples and family therapy specialist",
      rating: 4.9,
      reviews: 112,
      patients: 420,
      availability: "Available in 2 days",
      experience: "15 years",
      languages: ["English"],
      image: "SW",
    },
    {
      id: "james-patterson",
      name: "Dr. James Patterson",
      specialty: "Trauma & PTSD",
      bio: "Trauma-focused cognitive behavioral therapy",
      rating: 4.7,
      reviews: 87,
      patients: 310,
      availability: "Available in 3 days",
      experience: "14 years",
      languages: ["English"],
      image: "JP",
    },
    {
      id: "lisa-anderson",
      name: "Dr. Lisa Anderson",
      specialty: "Anxiety & Stress",
      bio: "Mindfulness-based stress reduction specialist",
      rating: 4.8,
      reviews: 103,
      patients: 390,
      availability: "Available Today",
      experience: "11 years",
      languages: ["English", "French"],
      image: "LA",
    },
    {
      id: "david-kim",
      name: "Dr. David Kim",
      specialty: "Depression Support",
      bio: "Psychodynamic therapy and depression treatment",
      rating: 4.6,
      reviews: 78,
      patients: 280,
      availability: "Available Tomorrow",
      experience: "9 years",
      languages: ["English", "Korean"],
      image: "DK",
    },
  ]


  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">Mind You</span>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Find Your Therapist</h1>
          <p className="text-muted-foreground">Browse our network of qualified mental health professionals</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Filters</h3>
              </div>

              {/* Specialty Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-foreground mb-3">Specialty</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedSpecialty(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !selectedSpecialty
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    All Specialties
                  </button>
                  {specialties.map((specialty) => (
                    <button
                      key={specialty}
                      onClick={() => setSelectedSpecialty(specialty)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedSpecialty === specialty
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>

            </Card>
          </div>

          {/* Providers Grid */}
          <div className="lg:col-span-3">
            {filteredProviders.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredProviders.map((doctor) => (
                  <Link key={doctor.id} href={`/providers/${doctor.id}`}>
                    <Card className="p-6 h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
                          {doctor.profile_image_url ? (
                            <img 
                              src={doctor.profile_image_url} 
                              alt={doctor.full_name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            getInitials(doctor.full_name)
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-foreground">{doctor.full_name}</h3>
                            {doctor.is_verified && (
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded-full font-medium">
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                        </div>
                      </div>

                      {doctor.bio && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{doctor.bio}</p>
                      )}

                      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
                        {doctor.years_of_experience && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Award className="w-4 h-4 text-primary" />
                            {formatExperience(doctor.years_of_experience)}
                          </div>
                        )}
                        {doctor.consultation_fee && (
                          <div className="text-xs text-muted-foreground">
                            ${doctor.consultation_fee} per session
                          </div>
                        )}
                      </div>

                      {doctor.qualifications && (
                        <div className="mb-4">
                          <p className="text-xs text-muted-foreground mb-2">Qualifications:</p>
                          <p className="text-xs text-foreground line-clamp-2">{doctor.qualifications}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium ${
                          doctor.is_active ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {doctor.is_active ? 'Available' : 'Not Available'}
                        </span>
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          View Profile
                        </Button>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No doctors found matching your criteria</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedSpecialty(null)
                  }}
                  className="bg-transparent"
                >
                  Clear Filters
                </Button>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
