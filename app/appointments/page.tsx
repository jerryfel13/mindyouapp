"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Calendar, Clock, MapPin, X, Users, Loader2, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { getUserData } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface Doctor {
  id: string
  full_name: string
  specialization: string
  bio?: string
  years_of_experience?: number
  consultation_fee?: number
  is_verified: boolean
}

interface Appointment {
  id: string
  user_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  duration_minutes: number
  appointment_type: string
  status: string
  notes?: string
  session_link?: string
  meeting_room_id?: string
  doctor?: {
    id: string
    full_name: string
    specialization: string
    profile_image_url?: string
    is_verified: boolean
  }
}

export default function AppointmentsPage() {
  const router = useRouter()
  const userData = getUserData()
  const userId = userData?.id || userData?.user_id
  
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([])
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(true)
  
  useEffect(() => {
    const fetchAvailableDoctors = async () => {
      try {
        setLoadingDoctors(true)
        const response = await api.getAvailableDoctors()
        setAvailableDoctors(response.data || [])
      } catch (error) {
        console.error('Error fetching available doctors:', error)
      } finally {
        setLoadingDoctors(false)
      }
    }

    fetchAvailableDoctors()
  }, [])

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!userId) return
      
      try {
        setLoadingAppointments(true)
        const response = await api.getUserAppointments(userId)
        const allAppointments = response.data || []
        
        const today = new Date().toISOString().split('T')[0]
        const upcoming = allAppointments.filter((apt: Appointment) => 
          apt.appointment_date >= today && apt.status !== 'completed' && apt.status !== 'cancelled'
        )
        const past = allAppointments.filter((apt: Appointment) => 
          apt.appointment_date < today || apt.status === 'completed'
        )
        
        setAppointments(upcoming)
        setPastAppointments(past)
      } catch (error) {
        console.error('Error fetching appointments:', error)
      } finally {
        setLoadingAppointments(false)
      }
    }

    fetchAppointments()
  }, [userId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const dateStr = date.toDateString()
    const todayStr = today.toDateString()
    const tomorrowStr = tomorrow.toDateString()
    
    if (dateStr === todayStr) return "Today"
    if (dateStr === tomorrowStr) return "Tomorrow"
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleCancel = async (id: string) => {
    try {
      await api.cancelAppointment(id)
      setAppointments(appointments.filter((apt) => apt.id !== id))
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      alert('Failed to cancel appointment. Please try again.')
    }
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
          <Link href="/dashboard">
            <Button variant="ghost">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Appointments</h1>
            <p className="text-muted-foreground">Manage and schedule your therapy sessions</p>
          </div>
          <Link href="/appointments/book">
            <Button className="bg-primary hover:bg-primary/90">
              <Calendar className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          </Link>
        </div>

        {/* Upcoming Appointments */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Upcoming Appointments</h2>
          {loadingAppointments ? (
            <Card className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading appointments...</p>
            </Card>
          ) : appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {appointment.doctor?.full_name || 'Doctor'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {appointment.doctor?.specialization || 'Specialist'}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      {appointment.appointment_type || 'Video Call'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {formatDate(appointment.appointment_date)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatTime(appointment.appointment_time)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {appointment.duration_minutes || 60} min
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {appointment.appointment_type === 'Video Call' && (
                      <Button 
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={() => router.push(`/appointments/video-call?id=${appointment.meeting_room_id || appointment.id}`)}
                      >
                        Join Session
                      </Button>
                    )}
                    <Button variant="outline" className="flex-1 bg-transparent">
                      Reschedule
                    </Button>
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-destructive" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No upcoming appointments</p>
              <Link href="/appointments/book">
                <Button className="bg-primary hover:bg-primary/90">Book Your First Appointment</Button>
              </Link>
            </Card>
          )}
        </div>

        {/* Past Appointments */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Past Appointments</h2>
          {pastAppointments.length > 0 ? (
            <div className="space-y-4">
              {pastAppointments.map((appointment) => (
                <Card key={appointment.id} className="p-6 opacity-75">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {appointment.doctor?.full_name || 'Doctor'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {appointment.doctor?.specialization || 'Specialist'}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                      {appointment.status === 'completed' ? 'Completed' : appointment.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {formatDate(appointment.appointment_date)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatTime(appointment.appointment_time)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {appointment.duration_minutes || 60} min
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center opacity-75">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No past appointments</p>
            </Card>
          )}
        </div>

        {/* Available Doctors Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Available Doctors</h2>
              <p className="text-muted-foreground">Browse our network of qualified mental health professionals</p>
            </div>
            <Link href="/providers">
              <Button variant="outline" className="bg-transparent">
                View All
              </Button>
            </Link>
          </div>

          {loadingDoctors ? (
            <Card className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading doctors...</p>
            </Card>
          ) : availableDoctors.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableDoctors.slice(0, 6).map((doctor) => (
                <Link key={doctor.id} href={`/appointments/book?doctorId=${doctor.id}`}>
                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                        {doctor.full_name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-foreground truncate">{doctor.full_name}</h3>
                          {doctor.is_verified && (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{doctor.specialization}</p>
                      </div>
                    </div>
                    {doctor.bio && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{doctor.bio}</p>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      {doctor.years_of_experience && (
                        <p className="text-xs text-muted-foreground">
                          {doctor.years_of_experience} {doctor.years_of_experience === 1 ? 'year' : 'years'} exp.
                        </p>
                      )}
                      {doctor.consultation_fee && (
                        <p className="text-sm font-semibold text-foreground">
                          ${doctor.consultation_fee}/session
                        </p>
                      )}
                    </div>
                    <Button className="w-full mt-4 bg-primary hover:bg-primary/90" size="sm">
                      Book Appointment
                    </Button>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No doctors available at the moment</p>
              <Link href="/providers">
                <Button variant="outline" className="bg-transparent">
                  Browse All Doctors
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
