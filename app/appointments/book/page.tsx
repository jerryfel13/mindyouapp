"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Calendar, Clock, ChevronLeft, ChevronRight, Loader2, CheckCircle, CreditCard, DollarSign, Lock, RefreshCw, QrCode, Copy, Phone } from "lucide-react"
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
  const [paymentMethod, setPaymentMethod] = useState<string>('gcash')
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentCompleted, setPaymentCompleted] = useState(false)
  const [paymentInitialized, setPaymentInitialized] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [checkingPayment, setCheckingPayment] = useState(false)
  const [paymentProgress, setPaymentProgress] = useState<any>(null)
  const [cpNumber, setCpNumber] = useState<string>('')
  const [cpNumberError, setCpNumberError] = useState<string>('')

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

  // Auto-check payment status every 5 seconds when payment is initialized
  useEffect(() => {
    if (paymentInitialized && paymentId && !paymentCompleted) {
      const interval = setInterval(() => {
        checkPaymentStatus()
      }, 5000) // Check every 5 seconds

      return () => clearInterval(interval)
    }
  }, [paymentInitialized, paymentId, paymentCompleted])

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
      
      // Move to payment step
      setStep(4)
    } catch (err) {
      console.error('Error creating appointment:', err)
      setError(err instanceof Error ? err.message : 'Failed to create appointment. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  // Validate CP number (Philippine phone number format)
  const validateCpNumber = (number: string): boolean => {
    // Remove spaces, dashes, and other characters
    const cleaned = number.replace(/[\s\-\(\)]/g, '')
    
    // Philippine mobile numbers: 09XXXXXXXXX (10 digits) or +639XXXXXXXXX (13 digits)
    const phMobileRegex = /^(09|\+639)[0-9]{9}$/
    
    if (!cleaned) {
      setCpNumberError('CP number is required')
      return false
    }
    
    if (!phMobileRegex.test(cleaned)) {
      setCpNumberError('Please enter a valid Philippine mobile number (09XXXXXXXXX)')
      return false
    }
    
    setCpNumberError('')
    return true
  }

  const handleCpNumberChange = (value: string) => {
    // Allow only numbers, +, spaces, dashes, and parentheses
    const cleaned = value.replace(/[^\d\+\s\-\(\)]/g, '')
    setCpNumber(cleaned)
    
    // Clear error when user starts typing
    if (cpNumberError) {
      setCpNumberError('')
    }
  }

  const initializePayment = async () => {
    if (!appointmentId || !selectedTherapist) {
      setError("Appointment information missing")
      return
    }

    // Validate CP number
    if (!validateCpNumber(cpNumber)) {
      setError("Please enter a valid CP number")
      return
    }

    setProcessingPayment(true)
    setError(null)

    try {
      const response = await api.initializePayment({
        appointment_id: appointmentId,
        payment_method: paymentMethod,
        cp_number: cpNumber.replace(/[\s\-\(\)]/g, '') // Clean the number before sending
      })
      
      setPaymentDetails(response.data.payment_details)
      setPaymentId(response.data.payment.id)
      setPaymentInitialized(true)
    } catch (err) {
      console.error('Error initializing payment:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize payment. Please try again.')
    } finally {
      setProcessingPayment(false)
    }
  }

  const checkPaymentStatus = async () => {
    if (!paymentId) return

    setCheckingPayment(true)
    try {
      const response = await api.verifyPayment(paymentId)
      
      // Also fetch payment progress
      const progressResponse = await api.getPaymentProgress(paymentId)
      setPaymentProgress(progressResponse.data)
      
      if (response.data.payment_status === 'completed') {
        setPaymentCompleted(true)
        // Redirect to confirmation page after a short delay
        setTimeout(() => {
          router.push(`/appointments/confirmation?id=${appointmentId}`)
        }, 1500)
      }
    } catch (err) {
      console.error('Error checking payment status:', err)
    } finally {
      setCheckingPayment(false)
    }
  }

  // Fetch payment progress when payment is initialized
  useEffect(() => {
    const fetchPaymentProgress = async () => {
      if (paymentId && paymentInitialized) {
        try {
          const response = await api.getPaymentProgress(paymentId)
          setPaymentProgress(response.data)
        } catch (err) {
          console.error('Error fetching payment progress:', err)
        }
      }
    }

    fetchPaymentProgress()
  }, [paymentId, paymentInitialized])

  // Auto-check payment status every 5 seconds when payment is initialized
  useEffect(() => {
    if (paymentInitialized && paymentId && !paymentCompleted) {
      const checkStatus = async () => {
        if (!paymentId) return
        setCheckingPayment(true)
        try {
          const response = await api.verifyPayment(paymentId)
          
          // Also fetch payment progress
          try {
            const progressResponse = await api.getPaymentProgress(paymentId)
            setPaymentProgress(progressResponse.data)
          } catch (progressErr) {
            console.error('Error fetching payment progress:', progressErr)
          }
          
          if (response.data.payment_status === 'completed') {
            setPaymentCompleted(true)
            setTimeout(() => {
              router.push(`/appointments/confirmation?id=${appointmentId}`)
            }, 1500)
          }
        } catch (err) {
          console.error('Error checking payment status:', err)
        } finally {
          setCheckingPayment(false)
        }
      }

      const interval = setInterval(checkStatus, 5000) // Check every 5 seconds
      return () => clearInterval(interval)
    }
  }, [paymentInitialized, paymentId, paymentCompleted, appointmentId])

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
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  s <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 4 && <div className={`flex-1 h-1 mx-2 ${s < step ? "bg-primary" : "bg-muted"}`}></div>}
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {step === 1 && "Select a Therapist"}
            {step === 2 && "Choose Date & Time"}
            {step === 3 && "Confirm Booking"}
            {step === 4 && "Complete Payment"}
          </h1>
          <p className="text-muted-foreground">
            {step === 1 && "Browse our network of qualified mental health professionals"}
            {step === 2 && "Pick a date and time that works for you"}
            {step === 3 && "Review and confirm your appointment"}
            {step === 4 && "Secure payment to finalize your appointment"}
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

        {step === 4 && (
          <Card className="p-8 mb-8">
            {paymentCompleted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">Payment Successful!</h3>
                <p className="text-muted-foreground mb-4">Redirecting to confirmation page...</p>
                <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
              </div>
            ) : paymentInitialized && paymentDetails ? (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Complete Your Payment</h3>
                  <p className="text-muted-foreground">Follow the instructions below to complete your payment</p>
                </div>

                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-6">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {/* Payment Progress Indicator */}
                {paymentProgress && (
                  <div className="bg-muted/50 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-foreground">Payment Progress</h4>
                      <span className="text-sm font-medium text-primary">
                        {paymentProgress.progress_percentage}%
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-2 mb-4">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${paymentProgress.progress_percentage}%` }}
                      />
                    </div>
                    {/* Progress Stages */}
                    <div className="space-y-3">
                      {paymentProgress.stages.map((stage: any, index: number) => (
                        <div
                          key={index}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                            stage.status === 'completed'
                              ? 'bg-green-500/10 border border-green-500/20'
                              : stage.status === 'current' || stage.isCurrent
                              ? 'bg-primary/10 border border-primary/20'
                              : 'bg-muted/30 border border-border'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              stage.status === 'completed'
                                ? 'bg-green-500 text-white'
                                : stage.status === 'current' || stage.isCurrent
                                ? 'bg-primary text-white'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {stage.status === 'completed' ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : stage.status === 'current' || stage.isCurrent ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <span className="text-xs font-bold">{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${
                                stage.status === 'completed'
                                  ? 'text-green-500'
                                  : stage.status === 'current' || stage.isCurrent
                                  ? 'text-primary'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {stage.label}
                            </p>
                            <p className="text-xs text-muted-foreground">{stage.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Amount */}
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Amount to Pay</p>
                  <p className="text-4xl font-bold text-primary">
                    ₱{paymentDetails.amount.toFixed(2)}
                  </p>
                </div>

                {/* QR Code */}
                <div className="flex justify-center mb-6">
                  <div className="bg-white p-6 rounded-lg border-2 border-border">
                    <div className="w-64 h-64 bg-muted flex items-center justify-center rounded-lg">
                      <QrCode className="w-32 h-32 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mt-2">QR Code will be displayed here</p>
                    </div>
                  </div>
                </div>

                {/* Payment Instructions */}
                <div className="bg-muted/50 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Payment Instructions
                  </h4>
                  <ol className="space-y-3">
                    {paymentDetails.payment_instructions.map((instruction: string, index: number) => (
                      <li key={index} className="flex gap-3 text-sm text-foreground">
                        <span className="font-bold text-primary min-w-[24px]">{index + 1}.</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Payment Details */}
                <div className="bg-muted/50 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold text-foreground mb-4">Payment Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Account Number</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground font-mono">
                          {paymentDetails.account_number}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(paymentDetails.account_number)
                            alert('Account number copied!')
                          }}
                          className="p-1 hover:bg-muted rounded"
                        >
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Account Name</span>
                      <span className="text-sm font-medium text-foreground">{paymentDetails.account_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Reference Number</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground font-mono">
                          {paymentDetails.reference_number}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(paymentDetails.reference_number)
                            alert('Reference number copied!')
                          }}
                          className="p-1 hover:bg-muted rounded"
                        >
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Expires In</span>
                      <span className="text-sm font-medium text-foreground">{paymentDetails.expiry_minutes} minutes</span>
                    </div>
                  </div>
                </div>

                {/* Status Check */}
                <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-6">
                  <div className="flex items-center gap-3">
                    <RefreshCw className={`w-5 h-5 text-blue-500 ${checkingPayment ? 'animate-spin' : ''}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">Checking payment status...</p>
                      <p className="text-xs text-muted-foreground">We'll automatically verify your payment</p>
                    </div>
                  </div>
                  <Button
                    onClick={checkPaymentStatus}
                    disabled={checkingPayment}
                    variant="outline"
                    size="sm"
                  >
                    {checkingPayment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Check Now
                      </>
                    )}
                  </Button>
                </div>

                {/* Cancel Payment */}
                <Button
                  onClick={async () => {
                    if (paymentId) {
                      try {
                        await api.cancelPayment(paymentId, 'Cancelled by user')
                        setPaymentInitialized(false)
                        setPaymentDetails(null)
                        setPaymentId(null)
                        setStep(3)
                      } catch (err) {
                        console.error('Error cancelling payment:', err)
                      }
                    }
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Cancel Payment
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-foreground mb-6">Payment Details</h3>
                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-6">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
                
                {/* Appointment Summary */}
                <div className="bg-muted/50 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold text-foreground mb-4">Appointment Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Therapist</span>
                      <span className="font-medium text-foreground">
                        {selectedDoctor?.full_name || 'Not selected'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium text-foreground">
                        {monthName.split(" ")[0]} {selectedDate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span className="font-medium text-foreground">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium text-foreground">60 minutes</span>
                    </div>
                    <div className="border-t border-border pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-foreground">Total Amount</span>
                        <span className="text-2xl font-bold text-primary">
                          {selectedDoctor?.consultation_fee 
                            ? `₱${parseFloat(selectedDoctor.consultation_fee).toFixed(2)}`
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-foreground mb-3 block">Payment Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPaymentMethod('gcash')}
                      disabled={processingPayment}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === 'gcash'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      } ${processingPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">GC</span>
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-foreground">GCash</p>
                          <p className="text-xs text-muted-foreground">Mobile Wallet</p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('paymaya')}
                      disabled={processingPayment}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === 'paymaya'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      } ${processingPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">PM</span>
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-foreground">PayMaya</p>
                          <p className="text-xs text-muted-foreground">Mobile Wallet</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* CP Number Input */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Contact Number (CP Number) <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <input
                      type="tel"
                      value={cpNumber}
                      onChange={(e) => handleCpNumberChange(e.target.value)}
                      placeholder="09XXXXXXXXX"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 bg-background text-foreground ${
                        cpNumberError
                          ? 'border-destructive focus:border-destructive'
                          : 'border-border focus:border-primary'
                      } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                    />
                  </div>
                  {cpNumberError && (
                    <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                      <span>⚠</span>
                      {cpNumberError}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Enter your {paymentMethod === 'gcash' ? 'GCash' : 'PayMaya'} registered mobile number (e.g., 09123456789)
                  </p>
                </div>

                {/* Confirm Payment Button */}
                <Button
                  onClick={initializePayment}
                  disabled={processingPayment || !selectedDoctor?.consultation_fee || !cpNumber || !!cpNumberError}
                  className="w-full bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm
                    </>
                  )}
                </Button>
              </>
            )}
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
          {step === 4 && !paymentCompleted && (
            <Button 
              onClick={() => setStep(3)} 
              variant="outline"
              className="bg-transparent"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
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
