"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Calendar, Clock, Users, LogOut, Settings, CheckCircle, XCircle, Loader2, Video, Phone } from "lucide-react"
import { NotificationBell } from "@/components/NotificationBell"
import DoctorProtectedRoute from "@/components/doctor-protected-route"
import { getUserData, clearAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import Link from "next/link"

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
  user?: {
    id: string
    full_name: string
    email_address: string
  }
}

function DoctorDashboardContent() {
  const router = useRouter()
  const userData = getUserData()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [showUpcoming, setShowUpcoming] = useState(true)

  const userId = userData?.id

  useEffect(() => {
    if (userId) {
      fetchAppointments()
    }
  }, [userId, filterStatus, showUpcoming])

  const fetchAppointments = async () => {
    if (!userId) {
      console.log('No userId found')
      setLoadingAppointments(false)
      return
    }
    
    try {
      setLoadingAppointments(true)
      const filters: any = {}
      if (showUpcoming) {
        filters.upcoming = true
      }
      if (filterStatus) {
        filters.status = filterStatus
      }
      
      // Use doctor-user endpoint since doctors are in users table with role='doctor'
      console.log('Fetching appointments for doctor userId:', userId, 'with filters:', filters)
      const response = await api.getDoctorUserAppointments(userId, filters)
      console.log('Appointments response:', response)
      
      // Handle different response formats
      const appointmentsData = response.data || response || []
      console.log('Appointments data:', appointmentsData)
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
      // Show error to user
      if (error instanceof Error) {
        console.error('Error details:', error.message)
        alert(`Error loading appointments: ${error.message}`)
      }
      setAppointments([])
    } finally {
      setLoadingAppointments(false)
    }
  }

  const handleUpdateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      await api.updateAppointment(appointmentId, { status })
      fetchAppointments()
    } catch (error) {
      console.error('Error updating appointment:', error)
      alert('Failed to update appointment status')
    }
  }

  const handleLogout = () => {
    clearAuth()
    router.push("/login")
  }

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-500'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500'
      case 'cancelled':
        return 'bg-red-500/20 text-red-500'
      case 'completed':
        return 'bg-blue-500/20 text-blue-500'
      default:
        return 'bg-gray-500/20 text-gray-500'
    }
  }

  const stats = {
    totalAppointments: appointments.length,
    pendingAppointments: appointments.filter(a => a.status.toLowerCase() === 'pending').length,
    confirmedAppointments: appointments.filter(a => a.status.toLowerCase() === 'confirmed').length,
    completedAppointments: appointments.filter(a => a.status.toLowerCase() === 'completed').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">Mind You - Doctor Portal</span>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <Link 
              href="/settings"
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-foreground" />
            </Link>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                {userData?.full_name?.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "D"}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground">{userData?.full_name || "Doctor"}</p>
                <p className="text-xs text-muted-foreground">{userData?.specialization || "Doctor"}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome, Dr. {userData?.full_name?.split(" ")[0] || "Doctor"}!</h1>
          <p className="text-muted-foreground">Manage your appointments and patient consultations</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-primary/10">
            <p className="text-sm text-muted-foreground mb-2">Total Appointments</p>
            <p className="text-3xl font-bold text-foreground">{stats.totalAppointments}</p>
          </Card>
          <Card className="p-6 bg-yellow-500/10">
            <p className="text-sm text-muted-foreground mb-2">Pending</p>
            <p className="text-3xl font-bold text-foreground">{stats.pendingAppointments}</p>
          </Card>
          <Card className="p-6 bg-green-500/10">
            <p className="text-sm text-muted-foreground mb-2">Confirmed</p>
            <p className="text-3xl font-bold text-foreground">{stats.confirmedAppointments}</p>
          </Card>
          <Card className="p-6 bg-blue-500/10">
            <p className="text-sm text-muted-foreground mb-2">Completed</p>
            <p className="text-3xl font-bold text-foreground">{stats.completedAppointments}</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="upcoming"
              checked={showUpcoming}
              onChange={(e) => setShowUpcoming(e.target.checked)}
              className="w-4 h-4 rounded border-input"
            />
            <label htmlFor="upcoming" className="text-sm text-foreground cursor-pointer">
              Show upcoming only
            </label>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border border-input bg-background text-foreground"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Appointments List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Your Appointments</h2>
            <p className="text-sm text-muted-foreground">Doctor ID: {userId}</p>
          </div>

          {loadingAppointments ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {appointment.user?.full_name || 'Patient'}
                        </h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{appointment.user?.email_address || ''}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {formatDate(appointment.appointment_date)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatTime(appointment.appointment_time)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {appointment.duration_minutes || 60} min
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Notes: </span>
                        {appointment.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {appointment.status.toLowerCase() === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateAppointmentStatus(appointment.id, 'confirmed')}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateAppointmentStatus(appointment.id, 'cancelled')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    )}
                    {/* Show Join Session button for any status except completed/cancelled */}
                    {/* Allow joining Video Call appointments (or default to Video Call if type not set) */}
                    {appointment.status.toLowerCase() !== 'completed' && 
                     appointment.status.toLowerCase() !== 'cancelled' && 
                     (appointment.appointment_type === 'Video Call' || !appointment.appointment_type) && (
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => router.push(`/appointments/video-call?id=${appointment.meeting_room_id || appointment.id}`)}
                      >
                        <Video className="w-4 h-4 mr-1" />
                        Join Session
                      </Button>
                    )}
                    {/* Show Mark Complete button for confirmed or scheduled appointments */}
                    {(appointment.status.toLowerCase() === 'confirmed' || 
                      appointment.status.toLowerCase() === 'scheduled') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateAppointmentStatus(appointment.id, 'completed')}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No appointments found</p>
              <p className="text-sm text-muted-foreground">
                {showUpcoming ? "You don't have any upcoming appointments." : "You don't have any appointments with the selected filters."}
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

export default function DoctorDashboardPage() {
  return (
    <DoctorProtectedRoute>
      <DoctorDashboardContent />
    </DoctorProtectedRoute>
  )
}

