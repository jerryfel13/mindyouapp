"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Calendar, Clock, Users, CheckCircle, XCircle, Loader2, LogOut, Settings, UserCheck, UserX, AlertCircle } from "lucide-react"
import AdminProtectedRoute from "@/components/admin-protected-route"
import { getUserData, clearAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

interface Doctor {
  id: string
  full_name: string
  email_address: string
  specialization: string
  bio?: string
  years_of_experience?: number
  consultation_fee?: number
  is_active: boolean
  is_verified: boolean
  created_at: string
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

function DoctorUIContent() {
  const router = useRouter()
  const userData = getUserData()
  const [activeTab, setActiveTab] = useState<'appointments' | 'doctors'>('appointments')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(true)
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterVerification, setFilterVerification] = useState<string>('')

  useEffect(() => {
    fetchAppointments()
  }, [filterStatus])

  useEffect(() => {
    fetchDoctors()
  }, [filterVerification])

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true)
      const filters: any = {}
      if (filterStatus) filters.status = filterStatus
      const response = await api.getAllAppointments(filters)
      setAppointments(response.data || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoadingAppointments(false)
    }
  }

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true)
      const filters: any = {}
      if (filterVerification === 'verified') filters.is_verified = true
      else if (filterVerification === 'unverified') filters.is_verified = false
      const response = await api.getDoctors(filters)
      setDoctors(response.data || [])
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoadingDoctors(false)
    }
  }

  const handleVerifyDoctor = async (doctorId: string, verify: boolean) => {
    try {
      await api.updateDoctor(doctorId, { is_verified: verify })
      fetchDoctors()
    } catch (error) {
      console.error('Error updating doctor:', error)
      alert('Failed to update doctor verification status')
    }
  }

  const handleToggleDoctorActive = async (doctorId: string, isActive: boolean) => {
    try {
      await api.updateDoctor(doctorId, { is_active: !isActive })
      fetchDoctors()
    } catch (error) {
      console.error('Error updating doctor:', error)
      alert('Failed to update doctor status')
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
    totalDoctors: doctors.length,
    unverifiedDoctors: doctors.filter(d => !d.is_verified).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">Mind You - Admin</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                {userData?.full_name?.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "A"}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground">{userData?.full_name || "Admin"}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Doctor Management Dashboard</h1>
          <p className="text-muted-foreground">Manage appointments and doctor verifications</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-primary/10">
            <p className="text-sm text-muted-foreground mb-2">Total Appointments</p>
            <p className="text-3xl font-bold text-foreground">{stats.totalAppointments}</p>
          </Card>
          <Card className="p-6 bg-yellow-500/10">
            <p className="text-sm text-muted-foreground mb-2">Pending Appointments</p>
            <p className="text-3xl font-bold text-foreground">{stats.pendingAppointments}</p>
          </Card>
          <Card className="p-6 bg-blue-500/10">
            <p className="text-sm text-muted-foreground mb-2">Total Doctors</p>
            <p className="text-3xl font-bold text-foreground">{stats.totalDoctors}</p>
          </Card>
          <Card className="p-6 bg-red-500/10">
            <p className="text-sm text-muted-foreground mb-2">Unverified Doctors</p>
            <p className="text-3xl font-bold text-foreground">{stats.unverifiedDoctors}</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'appointments'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Appointments
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'doctors'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Doctors
          </button>
        </div>

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">All Appointments</h2>
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

            {loadingAppointments ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <Card key={appointment.id} className="p-6">
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
                        <p className="text-sm text-muted-foreground mb-1">
                          Doctor: {appointment.doctor?.full_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.doctor?.specialization || 'Specialist'}
                        </p>
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
                      <p className="text-sm text-muted-foreground mb-4">{appointment.notes}</p>
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
                      {appointment.status.toLowerCase() === 'confirmed' && (
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
                <p className="text-muted-foreground">No appointments found</p>
              </Card>
            )}
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Doctor Management</h2>
              <select
                value={filterVerification}
                onChange={(e) => setFilterVerification(e.target.value)}
                className="px-4 py-2 rounded-lg border border-input bg-background text-foreground"
              >
                <option value="">All Doctors</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>

            {loadingDoctors ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : doctors.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {doctors.map((doctor) => (
                  <Card key={doctor.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{doctor.full_name}</h3>
                          {doctor.is_verified ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{doctor.specialization}</p>
                        <p className="text-xs text-muted-foreground">{doctor.email_address}</p>
                      </div>
                    </div>

                    {doctor.bio && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{doctor.bio}</p>
                    )}

                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      {doctor.years_of_experience && (
                        <span>{doctor.years_of_experience} years exp.</span>
                      )}
                      {doctor.consultation_fee && (
                        <span>${doctor.consultation_fee}/session</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {!doctor.is_verified && (
                        <Button
                          size="sm"
                          onClick={() => handleVerifyDoctor(doctor.id, true)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Verify
                        </Button>
                      )}
                      {doctor.is_verified && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerifyDoctor(doctor.id, false)}
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          Unverify
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleDoctorActive(doctor.id, doctor.is_active)}
                        className={doctor.is_active ? 'text-red-500' : 'text-green-500'}
                      >
                        {doctor.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No doctors found</p>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default function DoctorPage() {
  return (
    <AdminProtectedRoute>
      <DoctorUIContent />
    </AdminProtectedRoute>
  )
}


