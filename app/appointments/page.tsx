"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Calendar, Clock, MapPin, X } from "lucide-react"
import { useState } from "react"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      therapist: "Dr. Emily Chen",
      specialty: "Anxiety & Stress",
      date: "Today",
      time: "2:00 PM",
      duration: "60 min",
      type: "Video Call",
      status: "upcoming",
    },
    {
      id: 2,
      therapist: "Dr. Michael Rodriguez",
      specialty: "Depression Support",
      date: "Tomorrow",
      time: "10:00 AM",
      duration: "60 min",
      type: "In-Person",
      status: "upcoming",
    },
    {
      id: 3,
      therapist: "Dr. Sarah Williams",
      specialty: "Relationship Counseling",
      date: "Dec 15, 2024",
      time: "3:30 PM",
      duration: "60 min",
      type: "Video Call",
      status: "upcoming",
    },
  ])

  const pastAppointments = [
    {
      id: 4,
      therapist: "Dr. Emily Chen",
      specialty: "Anxiety & Stress",
      date: "Dec 8, 2024",
      time: "2:00 PM",
      duration: "60 min",
      type: "Video Call",
      status: "completed",
    },
    {
      id: 5,
      therapist: "Dr. Michael Rodriguez",
      specialty: "Depression Support",
      date: "Dec 1, 2024",
      time: "10:00 AM",
      duration: "60 min",
      type: "In-Person",
      status: "completed",
    },
  ]

  const handleCancel = (id: number) => {
    setAppointments(appointments.filter((apt) => apt.id !== id))
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
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{appointment.therapist}</h3>
                      <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      {appointment.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
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
                    <Button className="flex-1 bg-primary hover:bg-primary/90">Join Session</Button>
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
          <div className="space-y-4">
            {pastAppointments.map((appointment) => (
              <Card key={appointment.id} className="p-6 opacity-75">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{appointment.therapist}</h3>
                    <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                  </div>
                  <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                    Completed
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
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
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
