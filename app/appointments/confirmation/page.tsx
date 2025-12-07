"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Calendar, Clock, CheckCircle, Mail, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { getUserData } from "@/lib/auth"

interface Appointment {
  id: string
  user_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  duration_minutes: number
  appointment_type: string
  status: string
  doctor?: {
    id: string
    full_name: string
    specialization: string
  }
  user?: {
    id: string
    full_name: string
    email_address: string
  }
}

function ConfirmationPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const appointmentId = searchParams.get("id")
  const userData = getUserData()
  
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId) {
        setError("No appointment ID provided")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await api.getAppointmentById(appointmentId)
        setAppointment(response.data)
      } catch (err) {
        console.error('Error fetching appointment:', err)
        setError(err instanceof Error ? err.message : 'Failed to load appointment details')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointment()
  }, [appointmentId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading appointment details...</p>
        </div>
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted">
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">Mind You</span>
            </Link>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="p-8 text-center">
            <p className="text-destructive mb-4">{error || 'Appointment not found'}</p>
            <Link href="/appointments">
              <Button className="bg-primary hover:bg-primary/90">Back to Appointments</Button>
            </Link>
          </Card>
        </main>
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Appointment Confirmed!</h1>
          <p className="text-lg text-muted-foreground">Your therapy session has been successfully booked</p>
        </div>

        {/* Confirmation Details */}
        <Card className="p-8 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Appointment Details</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Heart className="w-6 h-6 text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Therapist</p>
                <p className="text-lg font-semibold text-foreground">
                  {appointment.doctor?.full_name || 'Doctor'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {appointment.doctor?.specialization || 'Specialist'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Calendar className="w-6 h-6 text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatDate(appointment.appointment_date)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Time</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatTime(appointment.appointment_time)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Duration: {appointment.duration_minutes || 60} minutes
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="p-8 bg-accent/5 border-accent/20 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">What's Next?</h3>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-3">
              <span className="text-primary font-bold">1.</span>
              <span>A confirmation email has been sent to your registered email address</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">2.</span>
              <span>You'll receive a reminder 24 hours before your appointment</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">3.</span>
              <span>Join your video call 5 minutes early using the link in your email</span>
            </li>
          </ul>
        </Card>

        {/* Confirmation Email */}
        <Card className="p-6 bg-muted/50 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-primary" />
            <p className="font-semibold text-foreground">Confirmation sent to</p>
          </div>
          <p className="text-muted-foreground">
            {appointment.user?.email_address || userData?.email_address || 'your email'}
          </p>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard" className="flex-1">
            <Button className="w-full bg-primary hover:bg-primary/90">Back to Dashboard</Button>
          </Link>
          <Link href="/appointments" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              View All Appointments
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="p-12 text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading appointment details...</p>
        </Card>
      </div>
    }>
      <ConfirmationPageContent />
    </Suspense>
  )
}
