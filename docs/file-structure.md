# File Structure

This document provides a comprehensive overview of the frontend file organization and the purpose of each directory and file.

## 📁 Root Directory Structure

```
frontend/
├── src/                    # Source code
├── public/                 # Static assets
├── docs/                   # Documentation files
├── .next/                  # Next.js build output (generated)
├── node_modules/           # Dependencies (generated)
├── package.json           # Project dependencies and scripts
├── package-lock.json      # Locked dependency versions
├── next.config.ts         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.mjs     # PostCSS configuration
├── components.json        # Shadcn/ui component configuration
├── .env.local             # Environment variables (local)
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
└── README.md              # Project overview
```

## 🎯 Source Code Structure (`/src`)

```
src/
├── app/                   # Next.js App Router pages
├── components/            # Reusable UI components
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries and configurations
├── store/                 # Redux store and slices
└── assets/                # Images, icons, and other assets
```

## 📱 App Router Structure (`/src/app`)

Next.js App Router provides file-based routing with special files for layouts, pages, and loading states.

```
app/
├── globals.css            # Global styles and Tailwind imports
├── layout.tsx             # Root layout component
├── page.tsx               # Home page (landing/dashboard)
├── loading.tsx            # Global loading UI (optional)
├── error.tsx              # Global error UI (optional)
├── not-found.tsx          # 404 page (optional)
├── auth/
│   ├── layout.tsx         # Auth layout (centered forms)
│   └── page.tsx           # Login/Register page
├── discover/
│   ├── layout.tsx         # Discover layout (optional)
│   └── page.tsx           # Swipe cards page
├── matches/
│   └── page.tsx           # User matches grid
├── messages/
│   ├── page.tsx           # Conversations list
│   └── [userId]/
│       └── page.tsx       # Individual chat page
├── profile/
│   └── page.tsx           # Profile view/edit page
└── setup/
    └── page.tsx           # Profile setup after registration
```

### Key App Router Files:

- **`layout.tsx`**: Shared layout components that wrap pages
- **`page.tsx`**: Page components that render for specific routes
- **`loading.tsx`**: Loading UI shown while page is loading
- **`error.tsx`**: Error boundary for handling page errors
- **`not-found.tsx`**: Custom 404 page for non-existent routes

### Dynamic Routes:
- **`[userId]`**: Dynamic route parameter for chat pages
- **`[...slug]`**: Catch-all routes (if needed for complex routing)

## 🧩 Components Structure (`/src/components`)

```
components/
├── ui/                    # Base UI components (Radix/Shadcn)
│   ├── button.tsx         # Button component with variants
│   ├── card.tsx           # Card container component
│   ├── input.tsx          # Form input component
│   ├── label.tsx          # Form label component
│   ├── radio-group.tsx    # Radio button group
│   └── slider.tsx         # Range slider component
├── auth/                  # Authentication-related components
│   ├── index.ts           # Barrel exports
│   ├── LoginForm.tsx      # Login form with validation
│   ├── RegisterForm.tsx   # Registration form
│   └── UserProfile.tsx    # User profile display
├── user/                  # User management components
│   ├── index.ts           # Barrel exports
│   ├── UserProfile.tsx    # User profile component
│   └── UserSettings.tsx   # User settings/preferences
├── GridBackground.tsx     # Animated grid background
├── MatchCard.tsx          # Swipeable user card
├── MatchNotification.tsx  # Match found notification
├── Navigation.tsx         # Main navigation component
├── ProfileCard.tsx        # Profile display card
├── ProtectedRoute.tsx     # Route protection wrapper
├── theme-provider.tsx     # Theme context provider
└── ThemeToggle.tsx        # Dark/light mode toggle
```

### Component Categories:

1. **UI Components** (`/ui`): Base components with consistent styling
2. **Feature Components**: Business logic components (auth, user management)
3. **Layout Components**: Navigation, backgrounds, containers
4. **Utility Components**: Route protection, theme management

## 🔧 Utility Libraries (`/src/lib`)

```
lib/
├── api.ts                 # Axios configuration and API functions
├── config.ts              # Application configuration constants
└── utils.ts               # General utility functions
```

### Key Files:

- **`api.ts`**: HTTP client setup, request interceptors, API endpoint functions
- **`config.ts`**: Environment variables, API URLs, app constants
- **`utils.ts`**: Helper functions, formatters, validators

## 🏪 State Management (`/src/store`)

```
store/
├── index.ts               # Store configuration and setup
├── hooks.ts               # Typed Redux hooks
├── provider.tsx           # Redux provider wrapper
└── slices/
    ├── authSlice.ts       # Authentication state
    ├── matchesSlice.ts    # Matches and swiping state
    ├── chatSlice.ts       # Chat and messaging state
    └── profileSlice.ts    # User profile state
```

## 🎨 Context Providers (`/src/contexts`)

```
contexts/
└── AuthContext.tsx        # Authentication context provider
```

## 🪝 Custom Hooks (`/src/hooks`)

```
hooks/
└── useAuth.ts             # Authentication hook utilities
```

## 🖼️ Assets (`/src/assets`)

```



## 📋 Configuration Files

### `next.config.ts`
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com'], // Allow Cloudinary images
  },
  experimental: {
    // Enable experimental features as needed
  },
}

export default nextConfig
```

### `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... more theme colors
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 🔗 Import Path Mapping

The `@/*` path mapping allows clean imports throughout the application:

```typescript
// Instead of relative imports
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../../hooks/useAuth';

// Use clean absolute imports
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
```

## 📂 File Naming Conventions

### Components
- **PascalCase**: `ProfileCard.tsx`, `MatchNotification.tsx`
- **Descriptive names**: Clear purpose and functionality
- **Feature prefixes**: `AuthProvider`, `UserSettings`

### Pages (App Router)
- **lowercase**: `page.tsx`, `layout.tsx`, `loading.tsx`
- **Special files**: Defined by Next.js App Router convention

### Utilities and Configs
- **camelCase**: `api.ts`, `utils.ts`, `config.ts`
- **Descriptive**: Clear indication of file purpose

### Types and Interfaces
- **PascalCase**: `UserProfile`, `MatchData`, `AuthState`
- **Descriptive**: Interface names match their purpose

## 🎯 Component Organization Patterns

### Barrel Exports (`index.ts`)
```typescript
// components/auth/index.ts
export { LoginForm } from './LoginForm';
export { RegisterForm } from './RegisterForm';
export { UserProfile } from './UserProfile';

// Usage
import { LoginForm, RegisterForm } from '@/components/auth';
```

### Component Co-location
```
components/
├── ProfileCard/
│   ├── ProfileCard.tsx
│   ├── ProfileCard.test.tsx
│   ├── ProfileCard.stories.tsx
│   └── index.ts
```

### Feature-based Organization
```
features/
├── authentication/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── types/
└── matching/
    ├── components/
    ├── hooks/
    ├── services/
    └── types/
```

## 🧪 Testing Structure (When Implemented)

```
src/
├── __tests__/             # Global tests
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx
└── utils/
    ├── helpers.ts
    └── helpers.test.ts
```

## 🔄 Development Workflow

### Creating New Components
```bash
# 1. Create component file
touch src/components/ui/new-component.tsx

# 2. Add to barrel export (if applicable)
echo "export { NewComponent } from './NewComponent';" >> src/components/ui/index.ts

# 3. Add tests
touch src/components/ui/new-component.test.tsx
```

### Adding New Pages
```bash
# Create new route
mkdir src/app/new-route
touch src/app/new-route/page.tsx
touch src/app/new-route/layout.tsx  # Optional
```

### Managing State
```bash
# Add new Redux slice
touch src/store/slices/newSlice.ts

# Update store configuration
# Edit src/store/index.ts to include new reducer
```

## 📊 Bundle Analysis

The file structure is optimized for Next.js automatic code splitting:

- **Route-based splitting**: Each page is automatically split
- **Component lazy loading**: Dynamic imports where beneficial
- **Asset optimization**: Images and fonts optimized by Next.js

## 🔧 Build Output

When built, the structure generates:

```
.next/
├── static/               # Static assets with hashing
├── server/               # Server-side code
└── cache/                # Build cache for faster rebuilds
```

This file structure provides a scalable, maintainable foundation that follows Next.js best practices and makes the codebase easy to navigate and extend.