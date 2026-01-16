# Migration Guide: Mock Data to Real APIs

Step-by-step guide to migrate the patient portal from mock data to real API endpoints.

## Overview

The patient portal currently uses mock data in service files. This guide covers migrating to the production API endpoints.

## Prerequisites

1. Admin portal running with API endpoints enabled
2. Database set up (Prisma with PostgreSQL) or in-memory storage
3. Environment variables configured

## Step 1: Configure Environment Variables

### Mobile App (Expo)

Create/update `.env` in `/apps/patient-mobile/`:

```bash
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3000

# Production
# EXPO_PUBLIC_API_URL=https://api.luxemedspa.com

# Expo Project ID (for push notifications)
EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
```

### Admin Portal

Create/update `.env.local` in `/apps/admin/`:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ISSUER=medical-spa-platform
JWT_AUDIENCE=patient-portal

# Database (for Prisma)
DATABASE_URL=postgresql://user:password@localhost:5432/medical_spa

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

## Step 2: Update Service Imports

### Before (Mock Data)

```typescript
// Old import from mock service
import { referralService } from '@/services/referrals/referralService';
```

### After (Real API)

```typescript
// New import from API service
import { referralsService } from '@/services/api/referrals';
```

## Step 3: Update Service Usage

### Referral Service Migration

**Before (with mock fallback):**
```typescript
// /apps/patient-mobile/services/referrals/referralService.ts
async getReferralProgram(): Promise<ReferralProgram> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/referrals/program`);
    if (!response.ok) throw new Error('Failed');
    return await response.json();
  } catch (error) {
    // MOCK DATA FALLBACK
    return {
      id: '1',
      referralCode: 'SARAH25',
      // ... mock data
    };
  }
}
```

**After (real API only):**
```typescript
// /apps/patient-mobile/services/api/referrals.ts
async getReferralProgram(): Promise<ReferralProgram> {
  const response = await apiClient.get<ReferralProgram>('/api/patient/referrals/program');

  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'Failed to fetch referral program');
  }

  return response.data;
}
```

### Appointments Service Migration

**Before:**
```typescript
// screens/AppointmentsScreen.tsx
import { appointments } from '@/data/mockData';

function AppointmentsScreen() {
  const [appointmentsList, setAppointmentsList] = useState(appointments);
  // Uses mock data directly
}
```

**After:**
```typescript
// screens/AppointmentsScreen.tsx
import { appointmentsService } from '@/services/api';

function AppointmentsScreen() {
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    try {
      setLoading(true);
      const response = await appointmentsService.getUpcoming();
      if (response.success && response.data) {
        setAppointmentsList(response.data);
      } else {
        setError(response.error?.message || 'Failed to load appointments');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }
}
```

## Step 4: Add Authentication

### Wrap App with Auth Provider

```typescript
// app/_layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack />
    </AuthProvider>
  );
}
```

### Protect Routes

```typescript
// app/(authenticated)/_layout.tsx
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';

export default function AuthenticatedLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <Stack />;
}
```

### Use Auth in Components

```typescript
// components/Profile.tsx
import { useAuth } from '@/contexts/AuthContext';

function Profile() {
  const { user, logout } = useAuth();

  return (
    <View>
      <Text>Welcome, {user?.firstName}!</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
```

## Step 5: Add Error Handling

### Create Error Boundary

```typescript
// components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorScreen error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Add Loading States

```typescript
function AppointmentCard({ appointmentId }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: () => appointmentsService.get(appointmentId),
  });

  if (isLoading) {
    return <AppointmentCardSkeleton />;
  }

  if (error) {
    return (
      <ErrorCard
        message="Failed to load appointment"
        onRetry={refetch}
      />
    );
  }

  return <AppointmentDetails appointment={data} />;
}
```

## Step 6: Add Offline Support

### Cache API Responses

```typescript
// services/cache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await AsyncStorage.getItem(`cache_${key}`);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      await AsyncStorage.removeItem(`cache_${key}`);
      return null;
    }

    return data as T;
  } catch {
    return null;
  }
}

export async function setCache<T>(key: string, data: T): Promise<void> {
  await AsyncStorage.setItem(
    `cache_${key}`,
    JSON.stringify({ data, timestamp: Date.now() })
  );
}
```

### Use Cache in Services

```typescript
async function getAppointments(): Promise<Appointment[]> {
  // Try cache first
  const cached = await getCached<Appointment[]>('appointments');
  if (cached) return cached;

  // Fetch from API
  const response = await apiClient.get('/api/patient/appointments');
  if (response.success && response.data) {
    await setCache('appointments', response.data);
    return response.data;
  }

  throw new Error(response.error?.message || 'Failed to fetch');
}
```

## Step 7: Update Stores/Context

### Before (Mock State)

```typescript
// stores/appointmentStore.ts
import { create } from 'zustand';
import { mockAppointments } from '@/data/mock';

export const useAppointmentStore = create((set) => ({
  appointments: mockAppointments,
  // Direct mock data
}));
```

### After (API-backed State)

```typescript
// stores/appointmentStore.ts
import { create } from 'zustand';
import { appointmentsService } from '@/services/api';

export const useAppointmentStore = create((set, get) => ({
  appointments: [],
  isLoading: false,
  error: null,

  fetchAppointments: async () => {
    set({ isLoading: true, error: null });
    const response = await appointmentsService.list();
    if (response.success) {
      set({ appointments: response.data, isLoading: false });
    } else {
      set({ error: response.error?.message, isLoading: false });
    }
  },

  bookAppointment: async (data) => {
    const response = await appointmentsService.book(data);
    if (response.success) {
      // Refetch list to include new appointment
      get().fetchAppointments();
    }
    return response;
  },
}));
```

## Step 8: Test Migration

### 1. Unit Tests

```typescript
// __tests__/services/referrals.test.ts
import { referralsService } from '@/services/api/referrals';

describe('ReferralsService', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = jest.fn();
  });

  test('getReferralProgram returns program data', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { referralCode: 'TEST25' },
      }),
    });

    const program = await referralsService.getReferralProgram();
    expect(program.referralCode).toBe('TEST25');
  });

  test('getReferralProgram throws on error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: { message: 'Unauthorized' },
      }),
    });

    await expect(referralsService.getReferralProgram()).rejects.toThrow();
  });
});
```

### 2. Integration Tests

```typescript
// __tests__/integration/auth-flow.test.ts
describe('Authentication Flow', () => {
  test('complete login flow', async () => {
    // 1. Register
    const registerResponse = await authService.register({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    });
    expect(registerResponse.success).toBe(true);

    // 2. Logout
    await authService.logout();

    // 3. Login
    const loginResponse = await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(loginResponse.success).toBe(true);

    // 4. Access protected resource
    const meResponse = await authService.getCurrentUser();
    expect(meResponse.success).toBe(true);
  });
});
```

## Migration Checklist

- [ ] Environment variables configured
- [ ] API client updated with auth handling
- [ ] Auth context/provider added
- [ ] Token storage implemented (SecureStore)
- [ ] Protected routes configured
- [ ] Error handling added
- [ ] Loading states implemented
- [ ] Offline caching added (optional)
- [ ] Unit tests updated
- [ ] Integration tests passing
- [ ] Manual testing complete

## Rollback Plan

If issues occur after migration:

1. **Quick Rollback:** Re-enable mock fallbacks temporarily
2. **Service Toggle:** Use feature flag to switch between mock and real
3. **Version Pin:** Keep previous app version available

```typescript
// Feature flag approach
const USE_REAL_API = process.env.EXPO_PUBLIC_USE_REAL_API === 'true';

async function getReferralProgram() {
  if (!USE_REAL_API) {
    return getMockReferralProgram();
  }
  return referralsService.getReferralProgram();
}
```

## Common Issues

### 1. CORS Errors

If you see CORS errors in development:
- Ensure admin portal has proper CORS headers
- Check that API URL doesn't have trailing slash

### 2. Token Not Sent

If authenticated requests fail:
- Verify token is stored correctly
- Check token expiry handling
- Ensure Authorization header format is correct

### 3. Network Errors on Device

If API works in simulator but not on device:
- Check device is on same network
- Try using IP address instead of localhost
- Verify firewall settings

### 4. Slow Response Times

If API calls are slow:
- Add request timeout handling
- Implement response caching
- Check network conditions
