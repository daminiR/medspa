import { useState, useEffect, useCallback, useRef } from 'react'
import NetInfo, { NetInfoState } from '@react-native-community/netinfo'
import { useChartingStore } from '../stores/chartingStore'
import { api, checkApiHealth, syncPendingSessions } from '../services/api'
import * as Haptics from 'expo-haptics'

interface SyncState {
  isOnline: boolean
  isSyncing: boolean
  lastSyncTime: Date | null
  pendingCount: number
  syncError: string | null
}

export function useSync() {
  const { pendingSessions, syncPendingSessions: clearPendingSessions } = useChartingStore()

  const [syncState, setSyncState] = useState<SyncState>({
    isOnline: true,
    isSyncing: false,
    lastSyncTime: null,
    pendingCount: pendingSessions.length,
    syncError: null,
  })

  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isOnline = state.isConnected ?? false
      setSyncState((prev) => ({ ...prev, isOnline }))

      // Auto-sync when coming back online
      if (isOnline && pendingSessions.length > 0) {
        syncNow()
      }
    })

    return () => unsubscribe()
  }, [pendingSessions.length])

  // Update pending count when sessions change
  useEffect(() => {
    setSyncState((prev) => ({ ...prev, pendingCount: pendingSessions.length }))
  }, [pendingSessions.length])

  // Auto-sync every 5 minutes when online
  useEffect(() => {
    if (syncState.isOnline && pendingSessions.length > 0) {
      syncIntervalRef.current = setInterval(() => {
        syncNow()
      }, 5 * 60 * 1000) // 5 minutes
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [syncState.isOnline, pendingSessions.length])

  const syncNow = useCallback(async () => {
    if (syncState.isSyncing || pendingSessions.length === 0) {
      return { success: true, synced: 0 }
    }

    setSyncState((prev) => ({ ...prev, isSyncing: true, syncError: null }))

    try {
      // Check if API is reachable
      const isHealthy = await checkApiHealth()
      if (!isHealthy) {
        setSyncState((prev) => ({
          ...prev,
          isSyncing: false,
          syncError: 'Server unavailable',
        }))
        return { success: false, error: 'Server unavailable' }
      }

      // Sync pending sessions
      const result = await syncPendingSessions(pendingSessions)

      if (result.success && result.data) {
        // Clear synced sessions from local storage
        await clearPendingSessions()

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

        setSyncState((prev) => ({
          ...prev,
          isSyncing: false,
          lastSyncTime: new Date(),
          pendingCount: 0,
          syncError: null,
        }))

        return { success: true, synced: result.data.synced }
      } else {
        setSyncState((prev) => ({
          ...prev,
          isSyncing: false,
          syncError: result.error || 'Sync failed',
        }))

        return { success: false, error: result.error }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync error'
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        syncError: errorMessage,
      }))

      return { success: false, error: errorMessage }
    }
  }, [syncState.isSyncing, pendingSessions, clearPendingSessions])

  const forceSyncAll = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    return syncNow()
  }, [syncNow])

  return {
    ...syncState,
    syncNow,
    forceSyncAll,
    canSync: syncState.isOnline && !syncState.isSyncing && pendingSessions.length > 0,
  }
}

export default useSync
