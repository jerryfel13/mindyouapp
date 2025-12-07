// API Configuration
import { getAuthHeader } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Normalize base URL - remove trailing slash if present
const normalizeBaseUrl = (url: string): string => {
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

export const api = {
  baseUrl: API_BASE_URL,
   
  async request(endpoint: string, options: RequestInit = {}) {
    // Ensure endpoint starts with / and base URL doesn't end with /
    const baseUrl = normalizeBaseUrl(API_BASE_URL);
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${normalizedEndpoint}`;
    
    // Get auth header if token exists
    const authHeader = getAuthHeader();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'An error occurred');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  // User registration
  async register(userData: {
    full_name: string;
    date_of_birth: string;
    gender?: string;
    civil_status?: string;
    address?: string;
    contact_number?: string;
    email_address: string;
    emergency_contact_person_number?: string;
    password: string;
  }) {
    return this.request('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // User login
  async login(credentials: {
    email_address: string;
    password: string;
  }) {
    return this.request('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Doctor login
  async doctorLogin(credentials: {
    email_address: string;
    password: string;
  }) {
    return this.request('/api/doctors/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Get all doctors
  async getDoctors(filters?: {
    specialization?: string;
    is_active?: boolean;
    is_verified?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (filters?.specialization) queryParams.append('specialization', filters.specialization);
    if (filters?.is_active !== undefined) queryParams.append('is_active', String(filters.is_active));
    if (filters?.is_verified !== undefined) queryParams.append('is_verified', String(filters.is_verified));
    
    const queryString = queryParams.toString();
    const endpoint = `/api/doctors${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint, {
      method: 'GET',
    });
  },

  // Get doctor by ID
  async getDoctorById(id: string) {
    return this.request(`/api/doctors/${id}`, {
      method: 'GET',
    });
  },

  // Get available doctors (active and verified) - from doctors table
  async getAvailableDoctors(specialization?: string) {
    const queryParams = new URLSearchParams();
    if (specialization) queryParams.append('specialization', specialization);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/doctors/available${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint, {
      method: 'GET',
    });
  },

  // Get available doctors from users table (role='doctor')
  async getAvailableDoctorsFromUsers(specialization?: string) {
    const queryParams = new URLSearchParams();
    if (specialization) queryParams.append('specialization', specialization);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/users/doctors/available${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint, {
      method: 'GET',
    });
  },

  // Get all doctors from users table (role='doctor')
  async getDoctorsFromUsers(filters?: {
    specialization?: string;
    is_active?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (filters?.specialization) queryParams.append('specialization', filters.specialization);
    if (filters?.is_active !== undefined) queryParams.append('is_active', String(filters.is_active));
    
    const queryString = queryParams.toString();
    const endpoint = `/api/users/doctors${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint, {
      method: 'GET',
    });
  },

  // Get appointments for a user
  async getUserAppointments(userId: string, filters?: { status?: string; upcoming?: boolean }) {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.upcoming !== undefined) queryParams.append('upcoming', String(filters.upcoming));
    
    const queryString = queryParams.toString();
    const endpoint = `/api/appointments/user/${userId}${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint, {
      method: 'GET',
    });
  },

  // Get appointments for a doctor (by doctor_id from doctors table)
  async getDoctorAppointments(doctorId: string, filters?: { status?: string; upcoming?: boolean }) {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.upcoming !== undefined) queryParams.append('upcoming', String(filters.upcoming));
    
    const queryString = queryParams.toString();
    const endpoint = `/api/appointments/doctor/${doctorId}${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint, {
      method: 'GET',
    });
  },

  // Get appointments for a doctor user (by user_id from users table where role='doctor')
  async getDoctorUserAppointments(userId: string, filters?: { status?: string; upcoming?: boolean }) {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.upcoming !== undefined) queryParams.append('upcoming', String(filters.upcoming));
    
    const queryString = queryParams.toString();
    const endpoint = `/api/appointments/doctor-user/${userId}${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint, {
      method: 'GET',
    });
  },

  // Get appointment by ID
  async getAppointmentById(id: string) {
    return this.request(`/api/appointments/${id}`, {
      method: 'GET',
    });
  },

  // Create new appointment
  async createAppointment(appointmentData: {
    user_id: string;
    doctor_id: string;
    appointment_date: string;
    appointment_time: string;
    duration_minutes?: number;
    appointment_type?: string;
    status?: string;
    notes?: string;
    meeting_room_id?: string;
  }) {
    return this.request('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  },

  // Update appointment
  async updateAppointment(id: string, updateData: {
    appointment_date?: string;
    appointment_time?: string;
    duration_minutes?: number;
    appointment_type?: string;
    status?: string;
    notes?: string;
    session_link?: string;
    meeting_room_id?: string;
  }) {
    return this.request(`/api/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // Cancel appointment
  async cancelAppointment(id: string) {
    return this.request(`/api/appointments/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin: Get all appointments
  async getAllAppointments(filters?: { status?: string; upcoming?: boolean }) {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.upcoming !== undefined) queryParams.append('upcoming', String(filters.upcoming));
    
    const queryString = queryParams.toString();
    const endpoint = `/api/appointments${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint, {
      method: 'GET',
    });
  },

  // Admin: Update doctor
  async updateDoctor(id: string, updateData: {
    full_name?: string;
    phone_number?: string;
    specialization?: string;
    qualifications?: string;
    bio?: string;
    years_of_experience?: number;
    consultation_fee?: number;
    profile_image_url?: string;
    is_active?: boolean;
    is_verified?: boolean;
  }) {
    return this.request(`/api/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // ========== PATIENT PAYMENT METHODS ==========
  // Get all payments for authenticated patient
  async getPatientPayments(filters?: {
    status?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.start_date) queryParams.append('start_date', filters.start_date);
    if (filters?.end_date) queryParams.append('end_date', filters.end_date);
    if (filters?.limit) queryParams.append('limit', String(filters.limit));
    if (filters?.offset) queryParams.append('offset', String(filters.offset));
    
    const queryString = queryParams.toString();
    const endpoint = `/api/payments/patient${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint, {
      method: 'GET',
    });
  },

  // Get payment statistics for patient
  async getPatientPaymentStats(filters?: {
    start_date?: string;
    end_date?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (filters?.start_date) queryParams.append('start_date', filters.start_date);
    if (filters?.end_date) queryParams.append('end_date', filters.end_date);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/payments/patient/stats${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint, {
      method: 'GET',
    });
  },

  // Get payment history for patient
  async getPatientPaymentHistory(filters?: {
    status?: string;
    payment_method?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.payment_method) queryParams.append('payment_method', filters.payment_method);
    if (filters?.start_date) queryParams.append('start_date', filters.start_date);
    if (filters?.end_date) queryParams.append('end_date', filters.end_date);
    if (filters?.limit) queryParams.append('limit', String(filters.limit));
    if (filters?.offset) queryParams.append('offset', String(filters.offset));
    if (filters?.sort_by) queryParams.append('sort_by', filters.sort_by);
    if (filters?.sort_order) queryParams.append('sort_order', filters.sort_order);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/payments/patient/history${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint, {
      method: 'GET',
    });
  },

  // Get payment by appointment ID
  async getPaymentByAppointmentId(appointmentId: string) {
    return this.request(`/api/payments/appointment/${appointmentId}`, {
      method: 'GET',
    });
  },

  // Initialize payment (create payment record and get payment details)
  async initializePayment(paymentData: {
    appointment_id: string;
    payment_method: 'gcash' | 'paymaya';
    cp_number?: string;
  }) {
    return this.request('/api/payments/initialize', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  // Verify payment status
  async verifyPayment(paymentId: string) {
    return this.request(`/api/payments/${paymentId}/verify`, {
      method: 'POST',
    });
  },

  // Get payment status
  async getPaymentStatus(paymentId: string) {
    return this.request(`/api/payments/${paymentId}/status`, {
      method: 'GET',
    });
  },

  // Get payment progress
  async getPaymentProgress(paymentId: string) {
    return this.request(`/api/payments/${paymentId}/progress`, {
      method: 'GET',
    });
  },

  // Get payment timeline
  async getPaymentTimeline(paymentId: string) {
    return this.request(`/api/payments/${paymentId}/timeline`, {
      method: 'GET',
    });
  },

  // Cancel payment
  async cancelPayment(paymentId: string, reason?: string) {
    return this.request(`/api/payments/${paymentId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  // Create payment from patient side (legacy)
  async createPaymentFromPatient(paymentData: {
    appointment_id: string;
    amount: number;
    currency?: string;
    payment_method: string;
    transaction_id?: string;
    payment_intent_id?: string;
    receipt_url?: string;
    metadata?: Record<string, any>;
  }) {
    return this.request('/api/payments/patient', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },
};

