"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Heart, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock,
  Loader2,
  Download,
  Filter,
  ArrowLeft,
  User
} from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import { getUserData } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import Link from "next/link"

interface Payment {
  id: string
  appointment_id: string
  doctor_id: string
  patient_id: string
  amount: number
  currency: string
  payment_method: string
  payment_status: string
  transaction_id?: string
  receipt_url?: string
  failure_reason?: string
  paid_at?: string
  refunded_at?: string
  refund_amount?: number
  created_at: string
  appointment?: {
    id: string
    appointment_date: string
    appointment_time: string
    appointment_type: string
    status: string
  }
  doctor?: {
    id: string
    full_name: string
    email_address: string
    specialization: string
  }
}

interface PaymentStats {
  total_paid: number
  completed_payments: number
  pending_payments: number
  failed_payments: number
  refunded_amount: number
  total_transactions: number
  this_month_paid: number
  this_year_paid: number
}

function PaymentsContent() {
  const router = useRouter()
  const userData = getUserData()
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    payment_method: '',
    start_date: '',
    end_date: ''
  })

  useEffect(() => {
    fetchStats()
    fetchPayments()
  }, [filters])

  const fetchStats = async () => {
    try {
      setLoadingStats(true)
      const response = await api.getPatientPaymentStats({
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined
      })
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching payment stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await api.getPatientPaymentHistory({
        status: filters.status || undefined,
        payment_method: filters.payment_method || undefined,
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        limit: 50,
        sort_by: 'created_at',
        sort_order: 'desc'
      })
      setPayments(response.data || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'PHP') => {
    // Always format as PHP (Philippine Peso)
    return `₱${parseFloat(amount).toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/20 text-green-500 border-green-500/30'
      case 'pending':
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
      case 'failed':
      case 'cancelled':
        return 'bg-red-500/20 text-red-500 border-red-500/30'
      case 'refunded':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30'
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30'
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'stripe':
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="w-4 h-4" />
      default:
        return <DollarSign className="w-4 h-4" />
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      status: '',
      payment_method: '',
      start_date: '',
      end_date: ''
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">My Payments</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
              {userData?.full_name?.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {loadingStats ? (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6">
                <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
              </Card>
            ))}
          </div>
        ) : stats && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 bg-primary/10 border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {formatCurrency(stats.total_paid)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completed_payments} completed payments
              </p>
            </Card>

            <Card className="p-6 bg-green-500/10 border-green-500/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">This Month</p>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {formatCurrency(stats.this_month_paid)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Current month payments
              </p>
            </Card>

            <Card className="p-6 bg-yellow-500/10 border-yellow-500/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Pending</p>
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {stats.pending_payments}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Payments processing
              </p>
            </Card>

            <Card className="p-6 bg-blue-500/10 border-blue-500/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <CreditCard className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {stats.total_transactions}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                All time transactions
              </p>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Filters</h3>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Payment Method</label>
              <select
                value={filters.payment_method}
                onChange={(e) => handleFilterChange('payment_method', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
              >
                <option value="">All Methods</option>
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Start Date</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">End Date</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
              />
            </div>
          </div>
          {(filters.status || filters.payment_method || filters.start_date || filters.end_date) && (
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </Card>

        {/* Payments List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Payment History</h2>
            <p className="text-sm text-muted-foreground">
              {payments.length} {payments.length === 1 ? 'payment' : 'payments'}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map((payment) => (
                <Card key={payment.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${getStatusColor(payment.payment_status)}`}>
                          {getPaymentMethodIcon(payment.payment_method)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {formatCurrency(payment.amount, payment.currency)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Dr. {payment.doctor?.full_name || 'Doctor'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payment.doctor?.specialization || 'Specialist'}
                          </p>
                        </div>
                      </div>
                      {payment.appointment && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(payment.appointment.appointment_date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {payment.appointment.appointment_time}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(payment.payment_status)}`}>
                        {payment.payment_status}
                      </span>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDateTime(payment.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Payment Method</p>
                      <p className="text-sm font-medium text-foreground capitalize">
                        {payment.payment_method.replace('_', ' ')}
                      </p>
                    </div>
                    {payment.transaction_id && (
                      <div>
                        <p className="text-xs text-muted-foreground">Transaction ID</p>
                        <p className="text-sm font-medium text-foreground font-mono">
                          {payment.transaction_id.substring(0, 12)}...
                        </p>
                      </div>
                    )}
                    {payment.paid_at && (
                      <div>
                        <p className="text-xs text-muted-foreground">Paid At</p>
                        <p className="text-sm font-medium text-foreground">
                          {formatDate(payment.paid_at)}
                        </p>
                      </div>
                    )}
                    {payment.receipt_url && (
                      <div>
                        <a
                          href={payment.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" />
                          Receipt
                        </a>
                      </div>
                    )}
                  </div>

                  {payment.failure_reason && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-sm text-red-500">
                        <span className="font-medium">Failure Reason: </span>
                        {payment.failure_reason}
                      </p>
                    </div>
                  )}

                  {payment.refund_amount && (
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-sm text-blue-500">
                        <span className="font-medium">Refunded: </span>
                        {formatCurrency(payment.refund_amount, payment.currency)} on {payment.refunded_at ? formatDate(payment.refunded_at) : 'N/A'}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No payments found</p>
              <p className="text-sm text-muted-foreground">
                {Object.values(filters).some(f => f) 
                  ? "Try adjusting your filters to see more results."
                  : "You don't have any payments yet."}
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

export default function PaymentsPage() {
  return (
    <ProtectedRoute>
      <PaymentsContent />
    </ProtectedRoute>
  )
}

