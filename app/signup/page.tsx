"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart } from "lucide-react"
import { api } from "@/lib/api"

export default function SignupPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    surname: "",
    firstName: "",
    middleName: "",
    birthDate: "",
    age: "",
    gender: "",
    civilStatus: "",
    address: "",
    contactNumber: "",
    email: "",
    emergencyContact: "",
    password: "",
    confirmPassword: "",
  })

  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Validate required fields (middleName is optional)
      const requiredFields = [
        'surname',
        'firstName',
        'birthDate',
        'gender',
        'civilStatus',
        'address',
        'contactNumber',
        'email',
        'emergencyContact',
        'password',
        'confirmPassword'
      ]

      for (const field of requiredFields) {
        // @ts-ignore
        if (!formData[field]) {
          setError("Please fill in all required fields.")
          setIsLoading(false)
          return
        }
      }

      if (!formData.email.includes("@")) {
        setError("Please enter a valid email.")
        setIsLoading(false)
        return
      }

      if (Number(formData.age) < 3) {
        setError("You must be at least 18 years old to register.")
        setIsLoading(false)
        return
      }

      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters.")
        setIsLoading(false)
        return
      }


      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.")
        setIsLoading(false)
        return
      }

      // Combine firstName, middleName, and surname into full_name
      const fullName = [
        formData.firstName.trim(),
        formData.middleName.trim(),
        formData.surname.trim()
      ]
        .filter(Boolean)
        .join(' ')

      // Map form data to backend API format
      const registrationData = {
        full_name: fullName,
        date_of_birth: formData.birthDate,
        gender: formData.gender,
        civil_status: formData.civilStatus,
        address: formData.address,
        contact_number: formData.contactNumber,
        email_address: formData.email,
        emergency_contact_person_number: formData.emergencyContact,
        password: formData.password,
      }

      // Call the registration API
      await api.register(registrationData)

      // Success - redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      // Handle API errors
      if (error instanceof Error) {
        setError(error.message || "An error occurred. Please try again.")
      } else {
        setError("An error occurred. Please try again.")
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col">
      

      <nav className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">Mind You</span>
          </Link>

          <Button variant="ghost" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </nav>


      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg p-8 bg-card shadow-lg">
          

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-muted-foreground">
              Join Mind You and start your mental health journey
            </p>
          </div>


          <form onSubmit={handleSubmit} className="space-y-5">
            
            {error && (
              <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}



            <div>
              <label className="block text-sm font-medium mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Middle Name 
              </label>
              <input
                name="middleName"
                type="text"
                value={formData.middleName}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Surname <span className="text-red-500">*</span>
              </label>
              <input
                name="surname"
                type="text"
                value={formData.surname}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border"
              />
            </div>

            

            <div>
              <label className="block text-sm font-medium mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border"
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Civil Status <span className="text-red-500">*</span>
              </label>
              <select
                name="civilStatus"
                value={formData.civilStatus}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border"
              >
                <option value="">Select Civil Status</option>
                <option>Single</option>
                <option>Married</option>
                <option>Separated</option>
                <option>Widowed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                placeholder="City, Province"
                className="w-full px-4 py-2 rounded-lg border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                name="contactNumber"
                type="text"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border"
              />
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Emergency Contact (Name & Number){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                name="emergencyContact"
                type="text"
                value={formData.emergencyContact}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border"
              />
            </div>


            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 text-lg bg-primary text-primary-foreground"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>


          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>

        </Card>
      </div>
    </div>
  )
}
