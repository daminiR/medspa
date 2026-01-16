# Patient Portal Implementation Guide

This Next.js 14 web portal mirrors the mobile app functionality with desktop and mobile web optimizations.

## Project Structure

```
/apps/patient-portal/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout with providers
│   │   ├── page.tsx                      # Redirects to dashboard
│   │   ├── auth/
│   │   │   ├── login/page.tsx           # Login page (magic link, OTP, social)
│   │   │   ├── register/page.tsx        # Registration form
│   │   │   └── verify/page.tsx          # Email/phone verification
│   │   ├── dashboard/
│   │   │   ├── layout.tsx               # Dashboard layout with navbar
│   │   │   └── page.tsx                 # Main dashboard
│   │   ├── appointments/
│   │   │   ├── page.tsx                 # Appointments list
│   │   │   └── [id]/page.tsx            # Appointment detail
│   │   ├── booking/
│   │   │   ├── page.tsx                 # 3-step booking flow
│   │   │   └── confirmed/page.tsx       # Booking confirmation
│   │   ├── photos/
│   │   │   ├── page.tsx                 # Before/after gallery
│   │   │   └── upload/page.tsx          # Photo upload
│   │   ├── messages/
│   │   │   ├── page.tsx                 # Conversations list
│   │   │   └── [id]/page.tsx            # Message thread
│   │   ├── profile/
│   │   │   └── page.tsx                 # Profile & settings
│   │   ├── referrals/
│   │   │   └── page.tsx                 # Referral program
│   │   ├── rewards/
│   │   │   └── page.tsx                 # Rewards center
│   │   ├── (public)/
│   │   │   ├── page.tsx                 # Homepage
│   │   │   ├── services/page.tsx        # Services catalog
│   │   │   ├── about/page.tsx           # About page
│   │   │   └── contact/page.tsx         # Contact page
│   │   └── api/
│   │       └── auth/                    # NextAuth API routes
│   ├── components/
│   │   ├── ui/                          # shadcn/ui components
│   │   ├── layout/                      # Navbar, Sidebar, Footer
│   │   ├── dashboard/                   # Dashboard-specific components
│   │   ├── appointments/                # Appointment components
│   │   ├── booking/                     # Booking flow components
│   │   ├── photos/                      # Photo gallery components
│   │   ├── messages/                    # Messaging components
│   │   ├── profile/                     # Profile components
│   │   ├── referrals/                   # Referral components
│   │   ├── rewards/                     # Rewards components
│   │   └── shared/                      # Shared components
│   ├── lib/
│   │   ├── utils.ts                     # Utility functions
│   │   └── auth.ts                      # Auth configuration
│   ├── hooks/
│   │   ├── useAuth.ts                   # Authentication hook
│   │   └── useAppointments.ts           # Appointments hook
│   └── styles/
│       └── globals.css                  # Global styles
├── public/
│   ├── manifest.json                    # PWA manifest
│   ├── icons/                           # App icons
│   └── images/                          # Static images
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── postcss.config.mjs
```

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand (via shared packages)
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Authentication**: NextAuth v5
- **Animations**: Framer Motion
- **PWA**: next-pwa

## Key Features

### 1. Authentication System
- Magic link email login
- SMS OTP verification
- WebAuthn/Passkeys for desktop
- Social login (Google, Facebook, Apple)
- Persistent sessions with cookies

### 2. Dashboard
- Personalized welcome message
- Interactive membership card with tier and points
- Quick action buttons (Book, Upload, Rewards, Messages)
- Upcoming appointments preview
- Recent photos gallery
- Messages preview
- Responsive 2-column (desktop) / single-column (mobile) layout

### 3. Booking Flow
- Step 1: Service selection with search/filter
- Step 2: Date & time picker (calendar UI)
- Step 3: Confirmation with review
- Progress indicator
- Side-by-side layout on desktop
- Fullscreen steps on mobile
- Add to calendar functionality

### 4. Appointments Management
- Filterable list (Upcoming, Past, All)
- Search functionality
- Appointment cards with full details
- Actions: Reschedule, Cancel, Add to Calendar, Download Receipt
- Table view (desktop) / Card view (mobile)
- Detailed appointment view with print-friendly receipt

### 5. Photo Gallery
- Before/after photo grid
- Side-by-side comparison view
- Filter by treatment type
- Upload with drag-and-drop
- Treatment and date tagging
- Privacy notices
- Responsive grid (3-4 columns desktop, 2 columns mobile)

### 6. Messaging
- Conversation list with unread badges
- AI chatbot banner
- Split view on desktop (list + thread)
- Separate views on mobile
- Text input with attachments
- Real-time updates (polling/WebSocket)
- Message thread history

### 7. Profile & Settings
- Personal information editor
- Membership details display
- Account settings (email, phone, password)
- Notification preferences
- Payment methods management
- Passkey management
- Sign out functionality

### 8. Referral Program
- Referral code display with copy button
- QR code generation
- Share buttons (email, social media)
- Referral statistics
- Rewards earned tracker
- Referral history table

### 9. Rewards Center
- Available rewards catalog
- Redemption interface
- Reward tier progression
- Expiration date tracking
- Points balance display
- Reward history

### 10. Public Marketing Pages
- Homepage with hero, services, testimonials
- Services catalog with pricing
- About page with team and facility
- Contact form with map
- SEO optimized with metadata
- Server-side rendering (SSR)

## Responsive Design

### Breakpoints
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md, lg)
- **Desktop**: > 1024px (xl)

### Mobile-First Approach
- Base styles for mobile
- Progressive enhancement for larger screens
- Touch-friendly buttons and interactions
- Hamburger menu on mobile
- Sidebar navigation on desktop

### Desktop Optimizations
- Keyboard shortcuts (e.g., "/" for search)
- Hover states
- Multi-window support
- Print-friendly pages
- Drag-and-drop file uploads

## API Integration

All API calls use the shared `@medical-spa/api-client` package:

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@medical-spa/api-client';

// Example: Fetch appointments
const { data, isLoading, error } = useQuery({
  queryKey: ['appointments'],
  queryFn: () => apiClient.appointments.list(),
});

// Example: Book appointment
const bookMutation = useMutation({
  mutationFn: (data) => apiClient.appointments.create(data),
  onSuccess: () => {
    // Handle success
  },
});
```

## Shared Packages

### @medical-spa/types
Common TypeScript types:
- User, Patient
- Appointment, Service
- Provider, Room
- Photo, Message
- Payment, Membership

### @medical-spa/api-client
API client with:
- HTTP client setup
- API endpoint methods
- Authentication handling
- Error handling
- Request/response types

### @medical-spa/ui
Shared UI components:
- Button, Input, Card
- Form components
- Layout components

## SEO & Performance

### Server-Side Rendering (SSR)
- Public pages use SSR for SEO
- Authenticated pages use Client-Side Rendering (CSR)
- Metadata API for SEO tags

### Image Optimization
- next/image for automatic optimization
- AVIF/WebP format support
- Lazy loading
- Responsive images

### Code Splitting
- Route-based splitting (automatic)
- Dynamic imports for heavy components
- Component-level splitting

### Caching Strategy
- React Query for data caching
- Stale-while-revalidate strategy
- Prefetching for better UX

## Progressive Web App (PWA)

### Features
- Service worker for offline support
- Manifest.json for installability
- App icons (192x192, 512x512)
- Splash screens
- Push notifications (future)

### Installation
- Install prompt on mobile web
- Add to home screen
- Standalone app mode

## Development Workflow

### Running Locally
```bash
cd apps/patient-portal
npm run dev        # Start dev server on port 3002
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # Run TypeScript checks
```

### Environment Variables
Create `.env.local`:
```
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Next Steps

1. **Complete Authentication**:
   - Set up NextAuth configuration
   - Implement magic link API
   - Add social login providers
   - Configure WebAuthn

2. **Build Remaining Pages**:
   - Appointments detail page
   - Booking flow pages
   - Photos upload page
   - Messages thread page
   - Public marketing pages

3. **Add Components**:
   - MembershipCard component
   - ServiceCard component
   - PhotoGallery component
   - MessageThread component
   - BookingWizard component

4. **Implement Features**:
   - Real-time messaging
   - Push notifications
   - Calendar integrations
   - Payment processing
   - Analytics tracking

5. **Testing & Deployment**:
   - Unit tests (Jest)
   - E2E tests (Playwright)
   - Lighthouse performance tests
   - Deploy to Vercel/Railway

## Reference Mobile App

The mobile app at `/apps/patient-mobile/` provides the complete feature set:
- `/app/(tabs)/dashboard.tsx` - Dashboard implementation
- `/app/(tabs)/appointments.tsx` - Appointments list
- `/app/(tabs)/photos.tsx` - Photo gallery
- `/app/(tabs)/messages.tsx` - Messaging
- `/app/(tabs)/profile.tsx` - Profile settings
- `/app/(auth)/login.tsx` - Login flow
- `/app/booking/` - Booking flow

Use these as reference for feature parity and UX patterns.

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [NextAuth.js](https://next-auth.js.org)
- [React Query](https://tanstack.com/query)
- [Framer Motion](https://www.framer.com/motion)
