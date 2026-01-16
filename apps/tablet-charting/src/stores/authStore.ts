import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface Provider {
  id: string
  name: string
  role: 'injector' | 'nurse' | 'physician'
  email: string
}

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  provider: Provider | null
  checkAuth: () => Promise<void>
  login: (provider: Provider) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  provider: null,

  checkAuth: async () => {
    try {
      const providerData = await AsyncStorage.getItem('provider')
      if (providerData) {
        const provider = JSON.parse(providerData)
        set({ isAuthenticated: true, provider, isLoading: false })
      } else {
        // For demo, auto-login with mock provider
        const mockProvider: Provider = {
          id: 'prov-001',
          name: 'Dr. Sarah Chen',
          role: 'physician',
          email: 'sarah.chen@luxemedspa.com',
        }
        await AsyncStorage.setItem('provider', JSON.stringify(mockProvider))
        set({ isAuthenticated: true, provider: mockProvider, isLoading: false })
      }
    } catch (error) {
      set({ isAuthenticated: false, provider: null, isLoading: false })
    }
  },

  login: async (provider: Provider) => {
    await AsyncStorage.setItem('provider', JSON.stringify(provider))
    set({ isAuthenticated: true, provider })
  },

  logout: async () => {
    await AsyncStorage.removeItem('provider')
    set({ isAuthenticated: false, provider: null })
  },
}))
