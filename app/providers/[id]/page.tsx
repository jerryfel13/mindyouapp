"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Award, Loader2, CheckCircle, MessageSquare, Globe, Clock } from "lucide-react"
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

export default function ProviderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.getDoctorById(params.id)
        setDoctor(response.data)
      } catch (err) {
        console.error('Error fetching doctor:', err)
        setError(err instanceof Error ? err.message : 'Failed to load doctor')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchDoctor()
    }
  }, [params.id])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  const formatExperience = (years?: number) => {
    if (!years) return "Experience not specified"
    return `${years} ${years === 1 ? 'year' : 'years'} experience`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-foreground">Loading doctor profile...</p>
        </div>
      </div>
    )
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <p className="text-red-500 mb-4">{error || 'Doctor not found'}</p>
          <Link href="/providers">
            <Button className="bg-primary hover:bg-primary/90">Back to Directory</Button>
          </Link>
        </Card>
      </div>
    )
  }

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
          <Link href="/providers">
            <Button variant="ghost">Back to Directory</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Doctor Header */}
        <div className="flex items-start gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-semibold flex-shrink-0">
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
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-4xl font-bold text-foreground">{doctor.full_name}</h1>
              {doctor.is_verified && (
                <span className="px-3 py-1 bg-green-500/20 text-green-500 text-sm rounded-full font-medium">
                  Verified
                </span>
              )}
            </div>
            <p className="text-xl text-muted-foreground mb-4">{doctor.specialization}</p>
            <div className="flex items-center gap-6">
              {doctor.years_of_experience && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Award className="w-5 h-5" />
                  {formatExperience(doctor.years_of_experience)}
                </div>
              )}
              <div className={`flex items-center gap-2 ${doctor.is_active ? 'text-green-500' : 'text-red-500'}`}>
                <Clock className="w-5 h-5" />
                {doctor.is_active ? 'Available' : 'Not Available'}
              </div>
            </div>
          </div>
          <Button 
            onClick={() => router.push(`/appointments/book?doctorId=${doctor.id}`)} 
            className="bg-primary hover:bg-primary/90"
            disabled={!doctor.is_active}
          >
            Book Appointment
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {doctor.bio && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed">{doctor.bio}</p>
              </Card>
            )}

            {doctor.qualifications && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">Qualifications</h2>
                <div className="space-y-3">
                  {doctor.qualifications.split('\n').map((qual, idx) => (
                    qual.trim() && (
                      <div key={idx} className="flex gap-3 text-muted-foreground">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{qual.trim()}</span>
                      </div>
                    )
                  ))}
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">License Information</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">License Number</p>
                  <p className="text-foreground font-medium">{doctor.license_number}</p>
                </div>
                {doctor.is_verified && (
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">Verified License</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Info</h3>
              <div className="space-y-4">
                {doctor.consultation_fee && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Consultation Fee</p>
                    <p className="text-2xl font-bold text-foreground">${doctor.consultation_fee}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Specialization</p>
                  <p className="text-lg font-semibold text-foreground">{doctor.specialization}</p>
                </div>
                {doctor.phone_number && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Contact</p>
                    <p className="text-foreground">{doctor.phone_number}</p>
                  </div>
                )}
                <div className={`flex items-center gap-2 ${doctor.is_active ? 'text-green-500' : 'text-red-500'} font-medium`}>
                  <Clock className="w-4 h-4" />
                  {doctor.is_active ? 'Available for appointments' : 'Currently not accepting new patients'}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Get in Touch</h3>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 mb-3"
                onClick={() => router.push(`/appointments/book?doctorId=${doctor.id}`)}
                disabled={!doctor.is_active}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </Card>

            {doctor.is_active && (
              <Card className="p-6 bg-primary/5 border-primary/20">
                <h3 className="text-lg font-semibold text-foreground mb-3">Ready to Book?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Schedule your first session with {doctor.full_name.split(" ")[1] || doctor.full_name} today.
                </p>
                <Button
                  onClick={() => router.push(`/appointments/book?doctorId=${doctor.id}`)}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Book Appointment
                </Button>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
