"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, getUserData } from "@/lib/auth"

interface DoctorProtectedRouteProps {
  children: React.ReactNode
}

export default function DoctorProtectedRoute({ children }: DoctorProtectedRouteProps) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // Check authentication and doctor role
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      const userData = getUserData()
      const isDoctor = userData?.role === 'doctor'

      setIsAuthorized(authenticated && isDoctor)
      setIsChecking(false)

      if (!authenticated) {
        // Redirect to login if not authenticated
        router.push("/login")
      } else if (!isDoctor) {
        // Redirect to dashboard if not doctor
        router.push("/dashboard")
      }
    }

    checkAuth()
  }, [router])

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authorization...</p>
        </div>
      </div>
    )
  }

  // Only render children if authorized
  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}


