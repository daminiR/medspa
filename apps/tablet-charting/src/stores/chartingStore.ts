import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Types matching the admin app
export interface InjectionPoint {
  id: string
  zoneId: string
  x: number // percentage 0-100
  y: number // percentage 0-100
  units?: number
  volume?: number
  depthId: string
  techniqueId: string
  needleGaugeId: string
  productId?: string
  notes?: string
  timestamp: Date
  productType: 'neurotoxin' | 'filler'
}

export interface FreehandAnnotation {
  id: string
  type: 'line' | 'circle' | 'arrow' | 'text'
  points: { x: number; y: number }[]
  color: string
  strokeWidth: number
  text?: string
}

export interface TreatmentPhoto {
  id: string
  uri: string
  type: 'before' | 'after' | 'during' | 'progress'
  angle: 'front' | 'left' | 'right' | '45-left' | '45-right' | 'top' | 'bottom'
  timestamp: Date
  annotations?: FreehandAnnotation[]
  notes?: string
}

export interface SOAPNotes {
  subjective: string
  objective: string
  assessment: string
  plan: string
}

export interface Patient {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  mrn: string
  phone: string
  email: string
  allergies?: string[]
  lastVisit?: Date
  photoUrl?: string
}

export interface TreatmentSession {
  id: string
  patientId: string
  providerId: string
  startTime: Date
  endTime?: Date
  productType: 'neurotoxin' | 'filler'
  injectionPoints: InjectionPoint[]
  freehandAnnotations: FreehandAnnotation[]
  photos: TreatmentPhoto[]
  soapNotes: SOAPNotes
  status: 'in-progress' | 'completed' | 'pending-sync'
  syncedAt?: Date
}

interface ChartingState {
  // Current session
  currentPatient: Patient | null
  currentSession: TreatmentSession | null

  // Charting state
  productType: 'neurotoxin' | 'filler'
  drawingMode: 'zones' | 'freehand'
  selectedPointId: string | null
  injectionPoints: InjectionPoint[]
  freehandAnnotations: FreehandAnnotation[]

  // Photos
  photos: TreatmentPhoto[]

  // SOAP Notes
  soapNotes: SOAPNotes

  // Pending offline sessions
  pendingSessions: TreatmentSession[]

  // Actions
  setCurrentPatient: (patient: Patient | null) => void
  startSession: (patient: Patient, providerId: string) => void
  setProductType: (type: 'neurotoxin' | 'filler') => void
  setDrawingMode: (mode: 'zones' | 'freehand') => void

  // Injection points
  addInjectionPoint: (point: Omit<InjectionPoint, 'id' | 'timestamp'>) => void
  updateInjectionPoint: (id: string, updates: Partial<InjectionPoint>) => void
  removeInjectionPoint: (id: string) => void
  selectPoint: (id: string | null) => void
  clearAllPoints: () => void

  // Freehand annotations
  addAnnotation: (annotation: Omit<FreehandAnnotation, 'id'>) => void
  removeAnnotation: (id: string) => void
  clearAnnotations: () => void

  // Photos
  addPhoto: (photo: Omit<TreatmentPhoto, 'id' | 'timestamp'>) => void
  updatePhoto: (id: string, updates: Partial<TreatmentPhoto>) => void
  removePhoto: (id: string) => void

  // SOAP Notes
  updateSOAPNotes: (notes: Partial<SOAPNotes>) => void

  // Session management
  saveSession: () => void
  completeSession: () => void
  syncPendingSessions: () => Promise<void>

  // Utilities
  getTotalUnits: () => number
  getTotalVolume: () => number
  getPointsByZone: () => Map<string, InjectionPoint[]>
}

const initialSOAPNotes: SOAPNotes = {
  subjective: '',
  objective: '',
  assessment: '',
  plan: '',
}

export const useChartingStore = create<ChartingState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentPatient: null,
      currentSession: null,
      productType: 'neurotoxin',
      drawingMode: 'zones',
      selectedPointId: null,
      injectionPoints: [],
      freehandAnnotations: [],
      photos: [],
      soapNotes: initialSOAPNotes,
      pendingSessions: [],

      // Actions
      setCurrentPatient: (patient) => set({ currentPatient: patient }),

      startSession: (patient, providerId) => {
        const session: TreatmentSession = {
          id: `session-${Date.now()}`,
          patientId: patient.id,
          providerId,
          startTime: new Date(),
          productType: get().productType,
          injectionPoints: [],
          freehandAnnotations: [],
          photos: [],
          soapNotes: initialSOAPNotes,
          status: 'in-progress',
        }
        set({
          currentPatient: patient,
          currentSession: session,
          injectionPoints: [],
          freehandAnnotations: [],
          photos: [],
          soapNotes: initialSOAPNotes,
          selectedPointId: null,
        })
      },

      setProductType: (type) => set({ productType: type }),
      setDrawingMode: (mode) => set({ drawingMode: mode }),

      // Injection points
      addInjectionPoint: (point) => {
        const newPoint: InjectionPoint = {
          ...point,
          id: `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        }
        set((state) => ({
          injectionPoints: [...state.injectionPoints, newPoint],
          selectedPointId: newPoint.id,
        }))
      },

      updateInjectionPoint: (id, updates) => {
        set((state) => ({
          injectionPoints: state.injectionPoints.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }))
      },

      removeInjectionPoint: (id) => {
        set((state) => ({
          injectionPoints: state.injectionPoints.filter((p) => p.id !== id),
          selectedPointId: state.selectedPointId === id ? null : state.selectedPointId,
        }))
      },

      selectPoint: (id) => set({ selectedPointId: id }),

      clearAllPoints: () => set({ injectionPoints: [], selectedPointId: null }),

      // Freehand annotations
      addAnnotation: (annotation) => {
        const newAnnotation: FreehandAnnotation = {
          ...annotation,
          id: `anno-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }
        set((state) => ({
          freehandAnnotations: [...state.freehandAnnotations, newAnnotation],
        }))
      },

      removeAnnotation: (id) => {
        set((state) => ({
          freehandAnnotations: state.freehandAnnotations.filter((a) => a.id !== id),
        }))
      },

      clearAnnotations: () => set({ freehandAnnotations: [] }),

      // Photos
      addPhoto: (photo) => {
        const newPhoto: TreatmentPhoto = {
          ...photo,
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        }
        set((state) => ({
          photos: [...state.photos, newPhoto],
        }))
      },

      updatePhoto: (id, updates) => {
        set((state) => ({
          photos: state.photos.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }))
      },

      removePhoto: (id) => {
        set((state) => ({
          photos: state.photos.filter((p) => p.id !== id),
        }))
      },

      // SOAP Notes
      updateSOAPNotes: (notes) => {
        set((state) => ({
          soapNotes: { ...state.soapNotes, ...notes },
        }))
      },

      // Session management
      saveSession: () => {
        const state = get()
        if (!state.currentSession) return

        const updatedSession: TreatmentSession = {
          ...state.currentSession,
          productType: state.productType,
          injectionPoints: state.injectionPoints,
          freehandAnnotations: state.freehandAnnotations,
          photos: state.photos,
          soapNotes: state.soapNotes,
        }

        set({ currentSession: updatedSession })
      },

      completeSession: () => {
        const state = get()
        if (!state.currentSession) return

        const completedSession: TreatmentSession = {
          ...state.currentSession,
          productType: state.productType,
          injectionPoints: state.injectionPoints,
          freehandAnnotations: state.freehandAnnotations,
          photos: state.photos,
          soapNotes: state.soapNotes,
          endTime: new Date(),
          status: 'pending-sync',
        }

        set((state) => ({
          pendingSessions: [...state.pendingSessions, completedSession],
          currentSession: null,
          currentPatient: null,
          injectionPoints: [],
          freehandAnnotations: [],
          photos: [],
          soapNotes: initialSOAPNotes,
          selectedPointId: null,
        }))
      },

      syncPendingSessions: async () => {
        const state = get()
        // TODO: Implement API sync
        // For now, just mark as synced
        const syncedSessions = state.pendingSessions.map((s) => ({
          ...s,
          status: 'completed' as const,
          syncedAt: new Date(),
        }))

        // In production, this would POST to API
        console.log('Syncing sessions:', syncedSessions)

        set({ pendingSessions: [] })
      },

      // Utilities
      getTotalUnits: () => {
        const state = get()
        return state.injectionPoints
          .filter((p) => p.productType === 'neurotoxin')
          .reduce((sum, p) => sum + (p.units || 0), 0)
      },

      getTotalVolume: () => {
        const state = get()
        return state.injectionPoints
          .filter((p) => p.productType === 'filler')
          .reduce((sum, p) => sum + (p.volume || 0), 0)
      },

      getPointsByZone: () => {
        const state = get()
        const map = new Map<string, InjectionPoint[]>()
        state.injectionPoints.forEach((point) => {
          const existing = map.get(point.zoneId) || []
          map.set(point.zoneId, [...existing, point])
        })
        return map
      },
    }),
    {
      name: 'charting-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        pendingSessions: state.pendingSessions,
        // Don't persist current session - it should be fresh each time
      }),
    }
  )
)
