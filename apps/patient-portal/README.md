# Medical Spa Patient Portal

A comprehensive Next.js 14 web portal for medical spa patients, providing desktop and mobile web access to appointments, photos, messaging, rewards, and more.

## Features

### Core Functionality
- **Dashboard**: Personalized view with membership card, quick actions, upcoming appointments
- **Appointments**: View, book, reschedule, and cancel appointments
- **Booking Flow**: 3-step booking process (service selection, date/time, confirmation)
- **Photo Gallery**: Upload and view before/after treatment photos
- **Messaging**: Secure communication with staff and AI chatbot
- **Profile & Settings**: Manage personal info, preferences, payment methods
- **Referral Program**: Share referral codes and earn rewards
- **Rewards Center**: View and redeem loyalty rewards

### Technical Features
- **Authentication**: Magic link, SMS OTP, social login, WebAuthn
- **Progressive Web App (PWA)**: Installable, offline support
- **Responsive Design**: Mobile-first with desktop optimizations
- **SEO Optimized**: Server-side rendering for public pages
- **Performance**: Image optimization, code splitting, lazy loading

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Authentication**: NextAuth v5
- **Animations**: Framer Motion
- **PWA**: next-pwa

## Project Structure

```
/src
├── app/                      # Next.js app router pages
│   ├── auth/                # Authentication pages
│   ├── dashboard/           # Dashboard
│   ├── appointments/        # Appointments management
│   ├── booking/             # Booking flow
│   ├── photos/              # Photo gallery
│   ├── messages/            # Messaging
│   ├── profile/             # Profile & settings
│   ├── referrals/           # Referral program
│   ├── rewards/             # Rewards center
│   └── (public)/            # Public marketing pages
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── layout/              # Layout components
│   └── shared/              # Shared components
├── lib/                     # Utilities
├── hooks/                   # Custom hooks
└── styles/                  # Global styles
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
cd apps/patient-portal
npm install
```

2. Create `.env.local`:
```env
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3002](http://localhost:3002)

### Build for Production

```bash
npm run build
npm run start
```

## Available Scripts

- `npm run dev` - Start development server (port 3002)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## Pages Overview

### Authentication
- `/auth/login` - Login with email/phone/social
- `/auth/register` - New patient registration
- `/auth/verify` - Email/phone verification

### Patient Portal (Authenticated)
- `/dashboard` - Main dashboard
- `/appointments` - Appointments list
- `/appointments/[id]` - Appointment details
- `/booking` - Book new appointment
- `/booking/confirmed` - Booking confirmation
- `/photos` - Photo gallery
- `/photos/upload` - Upload photos
- `/messages` - Conversations list
- `/messages/[id]` - Message thread
- `/profile` - Profile & settings
- `/referrals` - Referral program
- `/rewards` - Rewards center

### Public Pages (Marketing)
- `/` - Homepage (redirects to dashboard if logged in)
- `/services` - Services catalog (planned)
- `/about` - About page (planned)
- `/contact` - Contact form (planned)

## Responsive Design

### Breakpoints
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md, lg)
- **Desktop**: > 1024px (xl)

### Mobile-First Approach
- Base styles optimized for mobile
- Progressive enhancement for larger screens
- Touch-friendly interface elements
- Hamburger menu on mobile
- Sidebar navigation on desktop

## Shared Packages

The portal integrates with shared packages:

- `@medical-spa/types` - Common TypeScript types
- `@medical-spa/api-client` - API client (planned)
- `@medical-spa/ui` - Shared UI components (planned)

## API Integration

All API calls should use React Query for caching and state management:

```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['appointments'],
  queryFn: () => fetch('/api/appointments').then(r => r.json()),
});
```

## Environment Variables

```env
# Authentication
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your-secret-key

# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
```

## PWA Features

The portal is a Progressive Web App with:
- Service worker for offline support
- Installable on mobile and desktop
- App manifest with icons
- Splash screens
- Standalone app mode

## Performance Optimizations

- **Image Optimization**: next/image with AVIF/WebP
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Dynamic imports for heavy components
- **Caching**: React Query with stale-while-revalidate
- **SSR**: Server-side rendering for public pages

## SEO

Public pages use:
- Server-side rendering (SSR)
- Metadata API for meta tags
- Open Graph tags for social sharing
- Structured data (JSON-LD)
- Sitemap and robots.txt

## Development Workflow

1. **Feature Development**: Create new pages in `/src/app`
2. **Component Creation**: Add reusable components to `/src/components`
3. **Styling**: Use Tailwind CSS utility classes
4. **Type Safety**: Use TypeScript for all components
5. **Testing**: (Planned) Jest + React Testing Library
6. **E2E Testing**: (Planned) Playwright

## Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Other Platforms
```bash
npm run build
npm run start
```

## Future Enhancements

- [ ] NextAuth complete implementation
- [ ] Real-time messaging with WebSocket
- [ ] Push notifications
- [ ] Payment processing integration
- [ ] Calendar sync (Google Calendar, Apple Calendar)
- [ ] Social sharing for photos
- [ ] Analytics integration
- [ ] Unit and E2E tests
- [ ] A/B testing
- [ ] Accessibility improvements (WCAG 2.1 AA)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and type checks
4. Submit a pull request

## License

Private - Medical Spa Platform

## Support

For questions or issues, contact the development team.
