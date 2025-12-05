// API Configuration
import { getAuthHeader } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = {
  baseUrl: API_BASE_URL,
  
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
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

  // Get available doctors (active and verified)
  async getAvailableDoctors(specialization?: string) {
    const queryParams = new URLSearchParams();
    if (specialization) queryParams.append('specialization', specialization);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/doctors/available${queryString ? `?${queryString}` : ''}`;
    
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
};

