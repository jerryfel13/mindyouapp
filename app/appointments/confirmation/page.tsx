"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Calendar, Clock, CheckCircle, Mail } from "lucide-react"

export default function ConfirmationPage() {
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
                <p className="text-lg font-semibold text-foreground">Dr. Emily Chen</p>
                <p className="text-sm text-muted-foreground">Anxiety & Stress Specialist</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Calendar className="w-6 h-6 text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date</p>
                <p className="text-lg font-semibold text-foreground">December 15, 2024</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Time</p>
                <p className="text-lg font-semibold text-foreground">2:00 PM - 3:00 PM</p>
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
          <p className="text-muted-foreground">sarah.johnson@example.com</p>
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
