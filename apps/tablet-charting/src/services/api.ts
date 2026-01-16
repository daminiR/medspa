import AsyncStorage from '@react-native-async-storage/async-storage'
import { TreatmentSession, Patient, SOAPNotes } from '../stores/chartingStore'

// =============================================================================
// API Configuration
// =============================================================================

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// =============================================================================
// Auth Token Management
// =============================================================================

let authToken: string | null = null

export async function getAuthToken(): Promise<string | null> {
  if (authToken) return authToken
  authToken = await AsyncStorage.getItem('auth_token')
  return authToken
}

export async function setAuthToken(token: string): Promise<void> {
  authToken = token
  await AsyncStorage.setItem('auth_token', token)
}

export async function clearAuthToken(): Promise<void> {
  authToken = null
  await AsyncStorage.removeItem('auth_token')
}

// =============================================================================
// HTTP Client
// =============================================================================

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = await getAuthToken()

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP error ${response.status}`,
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('API request failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

// =============================================================================
// Patient API
// =============================================================================

export async function fetchPatients(
  search?: string,
  page = 1,
  limit = 20
): Promise<ApiResponse<{ patients: Patient[]; total: number }>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search ? { search } : {}),
  })

  return apiRequest<{ patients: Patient[]; total: number }>(
    `/patients?${params.toString()}`
  )
}

export async function fetchPatientById(id: string): Promise<ApiResponse<Patient>> {
  return apiRequest<Patient>(`/patients/${id}`)
}

export async function fetchPatientHistory(
  patientId: string
): Promise<ApiResponse<TreatmentSession[]>> {
  return apiRequest<TreatmentSession[]>(`/patients/${patientId}/sessions`)
}

// =============================================================================
// Treatment Session API
// =============================================================================

export async function createSession(
  session: Omit<TreatmentSession, 'id' | 'syncedAt'>
): Promise<ApiResponse<TreatmentSession>> {
  return apiRequest<TreatmentSession>('/sessions', {
    method: 'POST',
    body: JSON.stringify(session),
  })
}

export async function updateSession(
  sessionId: string,
  updates: Partial<TreatmentSession>
): Promise<ApiResponse<TreatmentSession>> {
  return apiRequest<TreatmentSession>(`/sessions/${sessionId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

export async function completeSession(
  sessionId: string,
  finalData: {
    injectionPoints: TreatmentSession['injectionPoints']
    photos: TreatmentSession['photos']
    soapNotes: SOAPNotes
  }
): Promise<ApiResponse<TreatmentSession>> {
  return apiRequest<TreatmentSession>(`/sessions/${sessionId}/complete`, {
    method: 'POST',
    body: JSON.stringify(finalData),
  })
}

export async function fetchSessionById(
  sessionId: string
): Promise<ApiResponse<TreatmentSession>> {
  return apiRequest<TreatmentSession>(`/sessions/${sessionId}`)
}

// =============================================================================
// Photo Upload API
// =============================================================================

export async function uploadPhoto(
  sessionId: string,
  photoUri: string,
  metadata: {
    type: 'before' | 'after' | 'during' | 'progress'
    angle: string
  }
): Promise<ApiResponse<{ url: string; thumbnailUrl: string }>> {
  try {
    const token = await getAuthToken()

    // Create form data for file upload
    const formData = new FormData()
    formData.append('file', {
      uri: photoUri,
      type: 'image/jpeg',
      name: `photo-${Date.now()}.jpg`,
    } as any)
    formData.append('type', metadata.type)
    formData.append('angle', metadata.angle)
    formData.append('sessionId', sessionId)

    const response = await fetch(`${API_BASE_URL}/photos/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Upload failed',
      }
    }

    return {
      success: true,
      data: {
        url: data.url,
        thumbnailUrl: data.thumbnailUrl,
      },
    }
  } catch (error) {
    console.error('Photo upload failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload error',
    }
  }
}

// =============================================================================
// Sync Service
// =============================================================================

interface SyncResult {
  synced: number
  failed: number
  errors: string[]
}

export async function syncPendingSessions(
  sessions: TreatmentSession[]
): Promise<ApiResponse<SyncResult>> {
  const result: SyncResult = {
    synced: 0,
    failed: 0,
    errors: [],
  }

  for (const session of sessions) {
    try {
      // First, upload any photos that have local URIs
      const uploadedPhotos = await Promise.all(
        session.photos.map(async (photo) => {
          if (photo.uri.startsWith('file://')) {
            const uploadResult = await uploadPhoto(session.id, photo.uri, {
              type: photo.type,
              angle: photo.angle,
            })
            if (uploadResult.success && uploadResult.data) {
              return {
                ...photo,
                uri: uploadResult.data.url,
                thumbnailUrl: uploadResult.data.thumbnailUrl,
              }
            }
          }
          return photo
        })
      )

      // Then sync the session
      const syncResult = await completeSession(session.id, {
        injectionPoints: session.injectionPoints,
        photos: uploadedPhotos,
        soapNotes: session.soapNotes,
      })

      if (syncResult.success) {
        result.synced++
      } else {
        result.failed++
        result.errors.push(syncResult.error || 'Unknown error')
      }
    } catch (error) {
      result.failed++
      result.errors.push(error instanceof Error ? error.message : 'Sync error')
    }
  }

  return {
    success: result.failed === 0,
    data: result,
  }
}

// =============================================================================
// Health Check
// =============================================================================

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      timeout: 5000,
    } as any)
    return response.ok
  } catch {
    return false
  }
}

// =============================================================================
// Products & Settings API
// =============================================================================

export async function fetchProducts(): Promise<
  ApiResponse<{
    neurotoxins: any[]
    fillers: any[]
  }>
> {
  return apiRequest('/products')
}

export async function fetchTreatmentTemplates(): Promise<ApiResponse<any[]>> {
  return apiRequest('/templates')
}

export async function saveChartingSettings(settings: any): Promise<ApiResponse<void>> {
  return apiRequest('/settings/charting', {
    method: 'PUT',
    body: JSON.stringify(settings),
  })
}

export async function fetchChartingSettings(): Promise<ApiResponse<any>> {
  return apiRequest('/settings/charting')
}

// =============================================================================
// Export API client
// =============================================================================

export const api = {
  // Auth
  getAuthToken,
  setAuthToken,
  clearAuthToken,

  // Patients
  fetchPatients,
  fetchPatientById,
  fetchPatientHistory,

  // Sessions
  createSession,
  updateSession,
  completeSession,
  fetchSessionById,

  // Photos
  uploadPhoto,

  // Sync
  syncPendingSessions,
  checkApiHealth,

  // Products & Settings
  fetchProducts,
  fetchTreatmentTemplates,
  saveChartingSettings,
  fetchChartingSettings,
}

export default api
