"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Search, Filter, Star, Users, Award } from "lucide-react"

export default function ProvidersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
  const [selectedAvailability, setSelectedAvailability] = useState<string | null>(null)

  const providers = [
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

  const specialties = ["Anxiety & Stress", "Depression Support", "Relationship Counseling", "Trauma & PTSD"]
  const availabilityOptions = ["Available Today", "Available Tomorrow", "Available in 2 days", "Available in 3 days"]

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSpecialty = !selectedSpecialty || provider.specialty === selectedSpecialty
    const matchesAvailability = !selectedAvailability || provider.availability === selectedAvailability
    return matchesSearch && matchesSpecialty && matchesAvailability
  })

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

              {/* Availability Filter */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Availability</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedAvailability(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !selectedAvailability
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    All Times
                  </button>
                  {availabilityOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelectedAvailability(option)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedAvailability === option
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {option}
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
                {filteredProviders.map((provider) => (
                  <Link key={provider.id} href={`/providers/${provider.id}`}>
                    <Card className="p-6 h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
                          {provider.image}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground">{provider.name}</h3>
                          <p className="text-sm text-muted-foreground">{provider.specialty}</p>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">{provider.bio}</p>

                      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-semibold text-foreground">{provider.rating}</span>
                          <span className="text-xs text-muted-foreground">({provider.reviews})</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-4 h-4" />
                          {provider.patients} patients
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">{provider.experience} experience</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {provider.languages.map((lang) => (
                            <span
                              key={lang}
                              className="px-2 py-1 bg-secondary/20 text-secondary-foreground text-xs rounded"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-accent">{provider.availability}</span>
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
                <p className="text-muted-foreground mb-4">No providers found matching your criteria</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedSpecialty(null)
                    setSelectedAvailability(null)
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
