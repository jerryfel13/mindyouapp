"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  Heart, 
  ArrowLeft, 
  Building2, 
  Calendar, 
  FileText, 
  Shield, 
  Save,
  Loader2 
} from "lucide-react"
import { api } from "@/lib/api"
import { getUserData, clearAuth } from "@/lib/auth"

interface SettingsData {
  clinic_info?: {
    clinic_name?: string
    address?: string
    phone?: string
    email?: string
    website?: string
    description?: string
  }
  appointment_booking?: {
    auto_confirm?: boolean
    allow_rescheduling?: boolean
    cancellation_policy?: string
    booking_advance_days?: number
    session_duration?: number
  }
  patient_records?: {
    data_retention_days?: number
    allow_patient_access?: boolean
    encryption_enabled?: boolean
    backup_frequency?: string
  }
  environment_support?: {
    timezone?: string
    language?: string
    date_format?: string
    enable_notifications?: boolean
    email_notifications?: boolean
    sms_notifications?: boolean
  }
}

function SettingsContent() {
  const router = useRouter()
  const userData = getUserData()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SettingsData>({})
  const [activeTab, setActiveTab] = useState<string>('clinic_info')

  useEffect(() => {
    if (!userData) {
      router.push('/login')
      return
    }
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await api.getSettings()
      setSettings(response.data || {})
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (category: string) => {
    try {
      setSaving(true)
      const categorySettings = settings[category as keyof SettingsData] || {}
      await api.updateSettings(category, categorySettings)
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...(prev[category as keyof SettingsData] || {}),
        [key]: value
      }
    }))
  }

  const handleLogout = () => {
    clearAuth()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">Mind You</span>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your clinic information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="lg:col-span-1 p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('clinic_info')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  activeTab === 'clinic_info'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span className="font-medium">Clinic Information</span>
              </button>
              <button
                onClick={() => setActiveTab('appointment_booking')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  activeTab === 'appointment_booking'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Appointment & Booking</span>
              </button>
              <button
                onClick={() => setActiveTab('patient_records')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  activeTab === 'patient_records'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">Patient Records</span>
              </button>
              <button
                onClick={() => setActiveTab('environment_support')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  activeTab === 'environment_support'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span className="font-medium">Environment/Support</span>
              </button>
            </nav>
          </Card>

          {/* Settings Content */}
          <Card className="lg:col-span-3 p-6">
            {activeTab === 'clinic_info' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Building2 className="w-6 h-6" />
                    Clinic Information Settings
                  </h2>
                  <p className="text-muted-foreground mb-6">Manage your clinic details and contact information</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="clinic_name">Clinic Name</Label>
                    <Input
                      id="clinic_name"
                      value={settings.clinic_info?.clinic_name || ''}
                      onChange={(e) => updateSetting('clinic_info', 'clinic_name', e.target.value)}
                      placeholder="Enter clinic name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={settings.clinic_info?.address || ''}
                      onChange={(e) => updateSetting('clinic_info', 'address', e.target.value)}
                      placeholder="Enter clinic address"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={settings.clinic_info?.phone || ''}
                        onChange={(e) => updateSetting('clinic_info', 'phone', e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.clinic_info?.email || ''}
                        onChange={(e) => updateSetting('clinic_info', 'email', e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={settings.clinic_info?.website || ''}
                      onChange={(e) => updateSetting('clinic_info', 'website', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={settings.clinic_info?.description || ''}
                      onChange={(e) => updateSetting('clinic_info', 'description', e.target.value)}
                      placeholder="Enter clinic description"
                      rows={4}
                    />
                  </div>
                </div>

                <Button
                  onClick={() => handleSave('clinic_info')}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Clinic Information
                    </>
                  )}
                </Button>
              </div>
            )}

            {activeTab === 'appointment_booking' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Calendar className="w-6 h-6" />
                    Appointment & Booking Settings
                  </h2>
                  <p className="text-muted-foreground mb-6">Configure appointment booking preferences</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-Confirm Appointments</Label>
                      <p className="text-sm text-muted-foreground">Automatically confirm appointments when booked</p>
                    </div>
                    <Switch
                      checked={settings.appointment_booking?.auto_confirm || false}
                      onCheckedChange={(checked) => updateSetting('appointment_booking', 'auto_confirm', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Rescheduling</Label>
                      <p className="text-sm text-muted-foreground">Allow patients to reschedule appointments</p>
                    </div>
                    <Switch
                      checked={settings.appointment_booking?.allow_rescheduling || false}
                      onCheckedChange={(checked) => updateSetting('appointment_booking', 'allow_rescheduling', checked)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
                    <Textarea
                      id="cancellation_policy"
                      value={settings.appointment_booking?.cancellation_policy || ''}
                      onChange={(e) => updateSetting('appointment_booking', 'cancellation_policy', e.target.value)}
                      placeholder="Enter cancellation policy"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="booking_advance_days">Booking Advance (Days)</Label>
                      <Input
                        id="booking_advance_days"
                        type="number"
                        value={settings.appointment_booking?.booking_advance_days || ''}
                        onChange={(e) => updateSetting('appointment_booking', 'booking_advance_days', parseInt(e.target.value) || 0)}
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="session_duration">Session Duration (Minutes)</Label>
                      <Input
                        id="session_duration"
                        type="number"
                        value={settings.appointment_booking?.session_duration || ''}
                        onChange={(e) => updateSetting('appointment_booking', 'session_duration', parseInt(e.target.value) || 60)}
                        placeholder="60"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleSave('appointment_booking')}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Booking Settings
                    </>
                  )}
                </Button>
              </div>
            )}

            {activeTab === 'patient_records' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-2 flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    Patient Records & Privacy Settings
                  </h2>
                  <p className="text-muted-foreground mb-6">Manage patient data and privacy settings</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Patient Access</Label>
                      <p className="text-sm text-muted-foreground">Allow patients to access their records</p>
                    </div>
                    <Switch
                      checked={settings.patient_records?.allow_patient_access || false}
                      onCheckedChange={(checked) => updateSetting('patient_records', 'allow_patient_access', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Encryption</Label>
                      <p className="text-sm text-muted-foreground">Encrypt patient records for security</p>
                    </div>
                    <Switch
                      checked={settings.patient_records?.encryption_enabled || false}
                      onCheckedChange={(checked) => updateSetting('patient_records', 'encryption_enabled', checked)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="data_retention_days">Data Retention (Days)</Label>
                    <Input
                      id="data_retention_days"
                      type="number"
                      value={settings.patient_records?.data_retention_days || ''}
                      onChange={(e) => updateSetting('patient_records', 'data_retention_days', parseInt(e.target.value) || 365)}
                      placeholder="365"
                    />
                  </div>

                  <div>
                    <Label htmlFor="backup_frequency">Backup Frequency</Label>
                    <Input
                      id="backup_frequency"
                      value={settings.patient_records?.backup_frequency || ''}
                      onChange={(e) => updateSetting('patient_records', 'backup_frequency', e.target.value)}
                      placeholder="Daily, Weekly, Monthly"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => handleSave('patient_records')}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Privacy Settings
                    </>
                  )}
                </Button>
              </div>
            )}

            {activeTab === 'environment_support' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Shield className="w-6 h-6" />
                    Environment/Support Settings
                  </h2>
                  <p className="text-muted-foreground mb-6">Configure system preferences and notifications</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        value={settings.environment_support?.timezone || ''}
                        onChange={(e) => updateSetting('environment_support', 'timezone', e.target.value)}
                        placeholder="Asia/Manila"
                      />
                    </div>
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Input
                        id="language"
                        value={settings.environment_support?.language || ''}
                        onChange={(e) => updateSetting('environment_support', 'language', e.target.value)}
                        placeholder="en"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="date_format">Date Format</Label>
                    <Input
                      id="date_format"
                      value={settings.environment_support?.date_format || ''}
                      onChange={(e) => updateSetting('environment_support', 'date_format', e.target.value)}
                      placeholder="MM/DD/YYYY"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive system notifications</p>
                    </div>
                    <Switch
                      checked={settings.environment_support?.enable_notifications || false}
                      onCheckedChange={(checked) => updateSetting('environment_support', 'enable_notifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={settings.environment_support?.email_notifications || false}
                      onCheckedChange={(checked) => updateSetting('environment_support', 'email_notifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      checked={settings.environment_support?.sms_notifications || false}
                      onCheckedChange={(checked) => updateSetting('environment_support', 'sms_notifications', checked)}
                    />
                  </div>
                </div>

                <Button
                  onClick={() => handleSave('environment_support')}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Environment Settings
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  )
}

