"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Star, Users, Award, Globe, Clock, CheckCircle, MessageSquare } from "lucide-react"

const providers: Record<
  string,
  {
    name: string
    specialty: string
    bio: string
    fullBio: string
    rating: number
    reviews: number
    patients: number
    availability: string
    experience: string
    languages: string[]
    image: string
    education: string[]
    certifications: string[]
    approach: string
    sessionPrice: number
    sessionDuration: number
    testimonials: Array<{ author: string; text: string; rating: number }>
  }
> = {
  "emily-chen": {
    name: "Dr. Emily Chen",
    specialty: "Anxiety & Stress",
    bio: "Specializing in cognitive behavioral therapy for anxiety disorders",
    fullBio:
      "Dr. Emily Chen is a licensed clinical psychologist with over 12 years of experience treating anxiety disorders and stress-related conditions. She specializes in cognitive behavioral therapy (CBT) and has helped hundreds of patients overcome anxiety and build resilience.",
    rating: 4.9,
    reviews: 128,
    patients: 450,
    availability: "Available Today",
    experience: "12 years",
    languages: ["English", "Mandarin"],
    image: "EC",
    education: ["Ph.D. in Clinical Psychology - Stanford University", "M.A. in Psychology - UC Berkeley"],
    certifications: ["Licensed Clinical Psychologist", "CBT Specialist", "Anxiety Disorders Specialist"],
    approach:
      "I use evidence-based cognitive behavioral therapy combined with mindfulness techniques to help clients manage anxiety and stress. My approach is collaborative and tailored to each individual's needs.",
    sessionPrice: 120,
    sessionDuration: 60,
    testimonials: [
      {
        author: "Jessica M.",
        text: "Dr. Chen helped me overcome my anxiety in just a few months. Her approach is practical and compassionate.",
        rating: 5,
      },
      {
        author: "Michael T.",
        text: "The best therapist I've worked with. She really understands anxiety and provides actionable strategies.",
        rating: 5,
      },
    ],
  },
  "michael-rodriguez": {
    name: "Dr. Michael Rodriguez",
    specialty: "Depression Support",
    bio: "Expert in treating depression and mood disorders",
    fullBio:
      "Dr. Michael Rodriguez is a board-certified psychiatrist and psychotherapist specializing in depression and mood disorders. With 10 years of clinical experience, he has developed a holistic approach to mental health treatment.",
    rating: 4.8,
    reviews: 95,
    patients: 380,
    availability: "Available Tomorrow",
    experience: "10 years",
    languages: ["English", "Spanish"],
    image: "MR",
    education: ["M.D. in Psychiatry - Johns Hopkins University", "B.S. in Biology - University of Texas"],
    certifications: ["Board-Certified Psychiatrist", "Depression Specialist", "Psychotherapist"],
    approach:
      "I combine medication management with psychotherapy to provide comprehensive depression treatment. My goal is to help clients regain joy and purpose in their lives.",
    sessionPrice: 150,
    sessionDuration: 60,
    testimonials: [
      {
        author: "Sarah K.",
        text: "Dr. Rodriguez's treatment plan changed my life. I finally feel like myself again.",
        rating: 5,
      },
      {
        author: "David L.",
        text: "Professional, caring, and effective. Highly recommended for anyone struggling with depression.",
        rating: 5,
      },
    ],
  },
}

export default function ProviderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const provider = providers[params.id]

  if (!provider) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Provider not found</p>
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
        {/* Provider Header */}
        <div className="flex items-start gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-semibold flex-shrink-0">
            {provider.image}
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-foreground mb-2">{provider.name}</h1>
            <p className="text-xl text-muted-foreground mb-4">{provider.specialty}</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold text-foreground">{provider.rating}</span>
                <span className="text-muted-foreground">({provider.reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-5 h-5" />
                {provider.patients} patients
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Award className="w-5 h-5" />
                {provider.experience} experience
              </div>
            </div>
          </div>
          <Button onClick={() => router.push("/appointments/book")} className="bg-primary hover:bg-primary/90">
            Book Appointment
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">About</h2>
              <p className="text-muted-foreground leading-relaxed">{provider.fullBio}</p>
            </Card>

            {/* Approach */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">My Approach</h2>
              <p className="text-muted-foreground leading-relaxed">{provider.approach}</p>
            </Card>

            {/* Education & Certifications */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Education & Certifications</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Education</h3>
                  <ul className="space-y-2">
                    {provider.education.map((edu, idx) => (
                      <li key={idx} className="flex gap-3 text-muted-foreground">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        {edu}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Certifications</h3>
                  <ul className="space-y-2">
                    {provider.certifications.map((cert, idx) => (
                      <li key={idx} className="flex gap-3 text-muted-foreground">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            {/* Testimonials */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Client Testimonials</h2>
              <div className="space-y-6">
                {provider.testimonials.map((testimonial, idx) => (
                  <div key={idx} className="pb-6 border-b border-border last:border-0 last:pb-0">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-2">{testimonial.text}</p>
                    <p className="text-sm font-semibold text-foreground">— {testimonial.author}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Info</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Session Price</p>
                  <p className="text-2xl font-bold text-foreground">${provider.sessionPrice}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Session Duration</p>
                  <p className="text-lg font-semibold text-foreground">{provider.sessionDuration} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {provider.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-3 py-1 bg-secondary/20 text-secondary-foreground text-xs rounded-full"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-accent font-medium">
                  <Clock className="w-4 h-4" />
                  {provider.availability}
                </div>
              </div>
            </Card>

            {/* Contact */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Get in Touch</h3>
              <Button className="w-full bg-primary hover:bg-primary/90 mb-3">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <Globe className="w-4 h-4 mr-2" />
                Visit Website
              </Button>
            </Card>

            {/* Book Now */}
            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="text-lg font-semibold text-foreground mb-3">Ready to Book?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Schedule your first session with {provider.name.split(" ")[1]} today.
              </p>
              <Button
                onClick={() => router.push("/appointments/book")}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Book Appointment
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
