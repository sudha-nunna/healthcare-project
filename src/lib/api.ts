// Get API base URL from environment or default to 4000
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// Log the API base URL for debugging (only in development)
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE);
  console.log('Frontend URL:', window.location.origin);
}

// Test backend connection
export async function testBackendConnection() {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      console.log('Backend connection successful:', data);
      return { success: true, data };
    }
    return { success: false, error: `Backend returned status ${res.status}` };
  } catch (err: any) {
    console.error('Backend connection test failed:', err);
    return { success: false, error: err.message };
  }
}

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  medicalConditions?: string[];
}

export interface Appointment {
  _id: string;
  userId: string;
  doctorId: {
    _id: string;
    name: string;
    specialty: string;
    hospital?: string;
  };
  date: string;
  time: string;
  status: 'booked' | 'cancelled' | 'completed';
}

export interface Insurance {
  _id: string;
  userId: string;
  provider: string;
  policyNumber: string;
  coverage?: { [serviceId: string]: number };
  validFrom: string;
  validTo: string;
}

export interface PriceEstimate {
  basePrice: number;
  coverage: number;
  outOfPocket: number;
}

async function request(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) } as Record<string,string>;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const url = `${API_BASE}${path}`;
  
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
  try {
    const res = await fetch(url, {
      headers,
      credentials: 'include',
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const text = await res.text();
    let data = {} as any;
    try { 
      data = text ? JSON.parse(text) : {}; 
    } catch(e) { 
      console.error('Failed to parse response:', text);
      data = { text, error: 'Invalid JSON response' }; 
    }
    if (!res.ok) {
      const errorMsg = data.message || data.error || res.statusText || 'Request failed';
      console.error(`API Error [${res.status}]:`, errorMsg, path);
      throw new Error(errorMsg);
    }
    return data;
  } catch (err: any) {
    clearTimeout(timeoutId); // Clear timeout in case of error
    
    // Handle AbortError (timeout)
    if (err.name === 'AbortError') {
      const errorMsg = `Request timeout: Backend server at ${API_BASE} did not respond within 10 seconds. Please check if the backend is running.`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    // Handle network errors
    if (err.message.includes('Failed to fetch') || 
        err.message.includes('NetworkError') || 
        err.message.includes('Network request failed') ||
        err.message.includes('ERR_CONNECTION_REFUSED')) {
      const errorMsg = `Cannot connect to backend server at ${API_BASE}. Please ensure:
1. Backend server is running (check backend terminal)
2. Backend is running on the correct port (${API_BASE.split(':').pop()})
3. CORS is enabled in backend
4. No firewall is blocking the connection`;
      console.error('Network error:', errorMsg);
      throw new Error(errorMsg);
    }
    throw err;
  }
}

// Auth
export async function signup(name: string, email: string, password: string) {
  return request('/api/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) });
}

export async function login(email: string, password: string) {
  return request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

// Specialists & Appointments
export async function listSpecialists(specialty?: string) {
  const qs = specialty ? `?specialty=${encodeURIComponent(specialty)}` : '';
  return request(`/api/specialists${qs}`);
}

export async function getSlots(doctorId: string, date: string) {
  const qs = `?doctorId=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`;
  return request(`/api/slots${qs}`);
}

export async function bookAppointment(userId: string, doctorId: string, date: string, time: string) {
  return request('/api/appointments', { method: 'POST', body: JSON.stringify({ userId, doctorId, date, time }) });
}

export async function cancelAppointment(appointmentId: string) {
  return request(`/api/appointments/${appointmentId}`, { method: 'DELETE' });
}

// Profile
export async function getProfile(): Promise<{ success: boolean; user: User; appointments: Appointment[] }> {
  return request('/api/profile');
}

export async function updateProfile(updates: Partial<User>) {
  return request('/api/profile', { method: 'PUT', body: JSON.stringify(updates) });
}

// Insurance
export async function getInsurance(): Promise<{ success: boolean; insurance: Insurance | null }> {
  return request('/api/insurance');
}

export async function updateInsurance(data: Partial<Insurance>) {
  return request('/api/insurance', { method: 'POST', body: JSON.stringify(data) });
}

export async function verifyInsurance(serviceId: string, cost: number) {
  return request('/api/insurance/verify', { method: 'POST', body: JSON.stringify({ serviceId, cost }) });
}

// Reviews
export async function getDoctorReviews(doctorId: string) {
  return request(`/api/reviews/doctor/${doctorId}`);
}

export async function createReview(doctorId: string, rating: number, comment: string) {
  return request('/api/reviews', { method: 'POST', body: JSON.stringify({ doctorId, rating, comment }) });
}

// Prices
export async function getPrices(): Promise<{ success: boolean; prices: { [serviceId: string]: { [hospital: string]: number } } }> {
  return request('/api/prices');
}

export async function getPriceEstimate(serviceId: string, hospital: string): Promise<{ success: boolean; estimate: PriceEstimate }> {
  return request(`/api/prices/estimate/${serviceId}?hospital=${encodeURIComponent(hospital)}`);
}

// Files
export async function uploadFile(token: string | null, file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data;
}

export default {
  signup,
  login,
  listSpecialists,
  getSlots,
  bookAppointment,
  cancelAppointment,
  uploadFile,
  getProfile,
  updateProfile,
  getInsurance,
  updateInsurance,
  verifyInsurance,
  getDoctorReviews,
  createReview,
  getPrices,
  getPriceEstimate,
};
