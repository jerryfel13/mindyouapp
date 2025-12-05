"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Calendar, Clock, MapPin, LogOut, Settings, Bell, ChevronRight, Users, Loader2 } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import { getUserData, clearAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

interface Doctor {
  id: string
  full_name: string
  specialization: string
  bio?: string
  years_of_experience?: number
  consultation_fee?: number
  is_verified: boolean
}

function DashboardContent() {
  const router = useRouter()
  const userData = getUserData()
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([])
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  
  const [user] = useState({
    name: userData?.full_name || "User",
    email: userData?.email_address || "",
    avatar: userData?.full_name?.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "U",
  })

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

  const handleLogout = () => {
    clearAuth()
    router.push("/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  const upcomingAppointments = [
    {
      id: 1,
      therapist: "Dr. Emily Chen",
      specialty: "Anxiety & Stress",
      date: "Today",
      time: "2:00 PM",
      duration: "60 min",
      type: "Video Call",
    },
    {
      id: 2,
      therapist: "Dr. Michael Rodriguez",
      specialty: "Depression Support",
      date: "Tomorrow",
      time: "10:00 AM",
      duration: "60 min",
      type: "In-Person",
    },
  ]

  const quickStats = [
    { label: "Total Sessions", value: "12", color: "bg-primary/10" },
    { label: "Streak Days", value: "7", color: "bg-accent/10" },
    { label: "Progress Score", value: "78%", color: "bg-secondary/10" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">Mind You</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-foreground" />
            </button>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                {user.avatar}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user.name.split(" ")[0]}!</h1>
          <p className="text-muted-foreground">Here's your mental health dashboard</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {quickStats.map((stat, idx) => (
            <Card key={idx} className={`p-6 ${stat.color}`}>
              <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Upcoming Appointments</h2>
              <Link href="/appointments">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{appointment.therapist}</h3>
                      <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      {appointment.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {appointment.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {appointment.time}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {appointment.duration}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={() => router.push(`/appointments/video-call?id=${appointment.id}`)}
                    >
                      Join Session
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      Reschedule
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <Link href="/appointments/book">
              <Button className="w-full mt-6 bg-primary hover:bg-primary/90">
                <Calendar className="w-4 h-4 mr-2" />
                Book New Appointment
              </Button>
            </Link>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/profile">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
                <Link href="/resources">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Heart className="w-4 h-4 mr-2" />
                    Mental Health Resources
                  </Button>
                </Link>
                <Link href="/support">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Bell className="w-4 h-4 mr-2" />
                    Get Support
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Wellness Tip */}
            <Card className="p-6 bg-accent/5 border-accent/20">
              <h3 className="text-lg font-semibold text-foreground mb-3">Daily Wellness Tip</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Take 5 minutes today to practice deep breathing. It can help reduce anxiety and improve focus.
              </p>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                Learn More
              </Button>
            </Card>

            {/* Progress */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">This Week</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Sessions Completed</span>
                    <span className="text-sm font-medium text-foreground">2/3</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "66%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Journaling Days</span>
                    <span className="text-sm font-medium text-foreground">5/7</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: "71%" }}></div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Available Doctors */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Available Doctors
                </h3>
                <Link href="/providers">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
              {loadingDoctors ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : availableDoctors.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {availableDoctors.slice(0, 5).map((doctor) => (
                    <Link key={doctor.id} href={`/providers/${doctor.id}`}>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-primary">
                            {getInitials(doctor.full_name)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">
                              {doctor.full_name}
                            </p>
                            {doctor.is_verified && (
                              <span className="px-1.5 py-0.5 bg-green-500/20 text-green-500 text-xs rounded-full">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {doctor.specialization}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {availableDoctors.length > 5 && (
                    <Link href="/providers">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        View {availableDoctors.length - 5} more doctors
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No doctors available</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
