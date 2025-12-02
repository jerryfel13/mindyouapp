import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Menu } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">Mind You</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition">
            Dashboard
          </Link>
          <Link href="/providers" className="text-muted-foreground hover:text-foreground transition">
            Find Therapists
          </Link>
          <Link href="/appointments" className="text-muted-foreground hover:text-foreground transition">
            Appointments
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
          <Link href="/profile">
            <Button variant="outline" size="sm">
              Profile
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
