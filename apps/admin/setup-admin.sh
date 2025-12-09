# Navigate to admin app
cd apps/admin

# Install Next.js and dependencies
pnpm add next@latest react@latest react-dom@latest
pnpm add typescript @types/react @types/react-dom @types/node -D
pnpm add tailwindcss postcss autoprefixer -D
pnpm add @tailwindcss/forms
pnpm add lucide-react react-big-calendar moment
pnpm add @types/react-big-calendar -D

# Create folder structure
mkdir -p src/app/{calendar,clients,sales,reports,messages,front-desk,marketing,manage}
mkdir -p src/components/{layout,ui,calendar}
mkdir -p src/lib
mkdir -p src/styles
mkdir -p public

# Initialize TypeScript
npx tsc --init

# Initialize Tailwind
npx tailwindcss init -p

# Create Next.js config
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
EOF

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
EOF

# Create tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
}
EOF

# Create globals.css
cat > src/styles/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

# Create root layout
cat > src/app/layout.tsx << 'EOF'
import '@/styles/globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
EOF

# Create home page
cat > src/app/page.tsx << 'EOF'
export default function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Medical Spa Admin</h1>
      <p className="mt-4">Redirecting to calendar...</p>
      <script dangerouslySetInnerHTML={{
        __html: `window.location.href = '/calendar';`
      }} />
    </div>
  )
}
EOF

# Create TopNavLayout component
cat > src/components/layout/TopNavLayout.tsx << 'EOF'
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Bell, Settings } from 'lucide-react'

const navigation = [
  { name: 'Front Desk', href: '/front-desk' },
  { name: 'Calendar', href: '/calendar' },
  { name: 'Messages', href: '/messages' },
  { name: 'Sales', href: '/sales' },
  { name: 'Clients', href: '/clients' },
  { name: 'Reports', href: '/reports' },
  { name: 'Marketing', href: '/marketing' },
  { name: 'Manage', href: '/manage' },
]

export default function TopNavLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-gray-900 text-white">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
                <span className="text-sm font-bold">MS</span>
              </div>
              <div>
                <h1 className="text-sm font-semibold">Medical Spa</h1>
                <p className="text-xs text-gray-400">Admin Portal</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>

            <nav className="flex space-x-1 ml-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-medium rounded-md
                    ${pathname === item.href 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800'
                    }
                  `}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <Bell className="h-5 w-5 cursor-pointer" />
            <Settings className="h-5 w-5 cursor-pointer" />
            <img
              src="https://ui-avatars.com/api/?name=Admin"
              className="h-8 w-8 rounded-full"
              alt="Admin"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden bg-gray-50">
        {children}
      </main>
    </div>
  )
}
EOF

# Create Calendar page
cat > src/app/calendar/page.tsx << 'EOF'
'use client'

import TopNavLayout from '@/components/layout/TopNavLayout'

export default function CalendarPage() {
  return (
    <TopNavLayout>
      <div className="h-full flex flex-col">
        <div className="bg-white border-b px-6 py-3">
          <h1 className="text-xl font-semibold">Calendar</h1>
        </div>
        <div className="flex-1 p-6">
          <p>Calendar view will go here</p>
        </div>
      </div>
    </TopNavLayout>
  )
}
EOF

# Create other pages
for page in clients sales reports messages front-desk marketing manage; do
  cat > src/app/$page/page.tsx << EOF
'use client'

import TopNavLayout from '@/components/layout/TopNavLayout'

export default function ${page^}Page() {
  return (
    <TopNavLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold">${page^}</h1>
        <p className="mt-4">Coming soon...</p>
      </div>
    </TopNavLayout>
  )
}
EOF
done

# Update package.json scripts
cat > package.json << 'EOF'
{
  "name": "@medical-spa/admin",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "latest",
    "react": "latest",
    "react-dom": "latest",
    "lucide-react": "latest",
    "react-big-calendar": "latest",
    "moment": "latest"
  },
  "devDependencies": {
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "@types/react-big-calendar": "latest",
    "typescript": "latest",
    "tailwindcss": "latest",
    "postcss": "latest",
    "autoprefixer": "latest"
  }
}
EOF

echo "✅ Admin app structure created!"
echo ""
echo "Next steps:"
echo "1. pnpm install"
echo "2. pnpm dev"
echo "3. Visit http://localhost:3001/calendar"
