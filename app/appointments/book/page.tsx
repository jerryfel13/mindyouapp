"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Calendar, Clock, ChevronLeft, ChevronRight, Loader2, CheckCircle } from "lucide-react"
import { api } from "@/lib/api"
import { getUserData } from "@/lib/auth"

interface Doctor {
  id: string
  full_name: string
  specialization: string
  bio?: string
  years_of_experience?: number
  consultation_fee?: number
  is_verified: boolean
}

function BookAppointmentPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const doctorIdFromUrl = searchParams.get("doctorId")
  const userData = getUserData()
  const userId = userData?.id || userData?.user_id
  
  const [step, setStep] = useState(1)
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(doctorIdFromUrl)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [appointmentId, setAppointmentId] = useState<string | null>(null)

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        // Fetch doctors from users table where role='doctor'
        const response = await api.getAvailableDoctorsFromUsers()
        setDoctors(response.data || [])
        
        // If doctorId is in URL, ensure it's selected
        if (doctorIdFromUrl && !selectedTherapist) {
          setSelectedTherapist(doctorIdFromUrl)
        }
      } catch (error) {
        console.error('Error fetching doctors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [doctorIdFromUrl])

  const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"]

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const convertTimeTo24Hour = (time12Hour: string): string => {
    const [time, period] = time12Hour.split(' ')
    const [hours, minutes] = time.split(':')
    let hour24 = parseInt(hours)
    
    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minutes}:00`
  }

  const formatDateForAPI = (day: string, month: Date): string => {
    const year = month.getFullYear()
    const monthNum = month.getMonth() + 1
    return `${year}-${monthNum.toString().padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  const handleConfirmBooking = async () => {
    if (!selectedTherapist || !selectedDate || !selectedTime || !userId) {
      setError("Please complete all fields")
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      // Format date and time for API
      const appointmentDate = formatDateForAPI(selectedDate, currentMonth)
      const appointmentTime = convertTimeTo24Hour(selectedTime)

      // Create the appointment
      const appointmentData = {
        user_id: userId,
        doctor_id: selectedTherapist, // This is the user_id of the doctor (from users table)
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        duration_minutes: 60,
        appointment_type: 'Video Call',
        status: 'scheduled'
      }

      const response = await api.createAppointment(appointmentData)
      setAppointmentId(response.data.id)
      
      // Redirect to confirmation page
      router.push(`/appointments/confirmation?id=${response.data.id}`)
    } catch (err) {
      console.error('Error creating appointment:', err)
      setError(err instanceof Error ? err.message : 'Failed to create appointment. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }


  const selectedDoctor = doctors.find((d) => d.id === selectedTherapist)

  const calendarDays = generateCalendarDays()
  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" })

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
          <Link href="/appointments">
            <Button variant="ghost">Back to Appointments</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  s <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 3 && <div className={`flex-1 h-1 mx-2 ${s < step ? "bg-primary" : "bg-muted"}`}></div>}
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {step === 1 && "Select a Therapist"}
            {step === 2 && "Choose Date & Time"}
            {step === 3 && "Confirm Booking"}
          </h1>
          <p className="text-muted-foreground">
            {step === 1 && "Browse our network of qualified mental health professionals"}
            {step === 2 && "Pick a date and time that works for you"}
            {step === 3 && "Review and confirm your appointment"}
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-4 mb-8">
            {loading ? (
              <Card className="p-12 text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading available doctors...</p>
              </Card>
            ) : doctors.length > 0 ? (
              doctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  onClick={() => setSelectedTherapist(doctor.id)}
                  className={`p-6 cursor-pointer transition-all ${
                    selectedTherapist === doctor.id ? "ring-2 ring-primary bg-primary/5" : "hover:shadow-lg"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-foreground">{doctor.full_name}</h3>
                        {doctor.is_verified && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded-full font-medium flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                      {doctor.bio && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{doctor.bio}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    {doctor.years_of_experience && (
                      <p className="text-xs text-muted-foreground">
                        {doctor.years_of_experience} {doctor.years_of_experience === 1 ? 'year' : 'years'} experience
                      </p>
                    )}
                    {doctor.consultation_fee && (
                      <p className="text-sm font-semibold text-foreground">
                        ${doctor.consultation_fee} per session
                      </p>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No doctors available at the moment</p>
                <Link href="/providers">
                  <Button variant="outline" className="bg-transparent">
                    Browse All Doctors
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Calendar */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">{monthName}</h3>
                <div className="flex gap-2">
                  <button onClick={handlePrevMonth} className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={handleNextMonth} className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => day && setSelectedDate(day.toString())}
                    disabled={!day}
                    className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                      !day
                        ? "text-transparent"
                        : selectedDate === day?.toString()
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80 text-foreground"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Available Times</h3>
              <div className="grid grid-cols-2 gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      selectedTime === time
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {step === 3 && (
          <Card className="p-8 mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-6">Booking Summary</h3>
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-6">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <Heart className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Therapist</p>
                  <p className="font-semibold text-foreground">
                    {doctors.find((d) => d.id === selectedTherapist)?.full_name || 'Not selected'}
                  </p>
                  {doctors.find((d) => d.id === selectedTherapist)?.specialization && (
                    <p className="text-xs text-muted-foreground">
                      {doctors.find((d) => d.id === selectedTherapist)?.specialization}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold text-foreground">
                    {monthName.split(" ")[0]} {selectedDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-semibold text-foreground">{selectedTime}</p>
                </div>
              </div>
            </div>
          </Card>
        )}


        <div className="flex gap-4">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="bg-transparent">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          )}
          <div className="flex-1"></div>
          {step < 3 && (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={(step === 1 && !selectedTherapist) || (step === 2 && (!selectedDate || !selectedTime))}
              className="bg-primary hover:bg-primary/90"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          {step === 3 && (
            <Button 
              onClick={handleConfirmBooking} 
              disabled={isCreating || !userId}
              className="bg-primary hover:bg-primary/90"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Appointment...
                </>
              ) : (
                <>
                  Confirm Booking
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}

export default function BookAppointmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="p-12 text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </Card>
      </div>
    }>
      <BookAppointmentPageContent />
    </Suspense>
  )
}
