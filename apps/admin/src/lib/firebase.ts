// Firebase Configuration and Firestore Instance
// This module initializes Firebase and exports the Firestore database instance

import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  enableNetwork,
  disableNetwork,
  Unsubscribe,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
  Timestamp
} from 'firebase/firestore'

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase only once
let app: FirebaseApp
let db: Firestore

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    const existingApps = getApps()
    if (existingApps.length > 0) {
      app = existingApps[0]
    } else {
      app = initializeApp(firebaseConfig)
    }
  }
  return app
}

function getFirestoreDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp())
  }
  return db
}

// Export Firestore instance
export const firestore = typeof window !== 'undefined' ? getFirestoreDb() : null

// Export the getFirebaseApp function for use in other modules
export { getFirebaseApp }

// Re-export Firestore utilities for convenience
export {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  enableNetwork,
  disableNetwork,
  Timestamp
}

export type {
  Unsubscribe,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot
}

// Helper function to check if Firebase is configured
export function isFirebaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  )
}

// Collection paths
export const COLLECTIONS = {
  APPOINTMENTS: 'appointments',
  WAITING_ROOM: 'waitingRoom',
  NOTIFICATIONS: 'notifications',
  WAITLIST_OFFERS: 'waitlistOffers',
  ROOMS: 'rooms',
  TREATMENTS: 'treatments'
} as const

// Helper to get waiting room queue collection path
export function getWaitingRoomQueuePath(locationId: string): string {
  return `${COLLECTIONS.WAITING_ROOM}/${locationId}/queue`
}

// Helper to get staff notifications collection path
export function getStaffNotificationsPath(staffUserId: string): string {
  return `${COLLECTIONS.NOTIFICATIONS}/${staffUserId}/items`
}
