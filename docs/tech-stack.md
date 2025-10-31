# Tech Stack

The Charmd frontend is built using modern React technologies with a focus on performance, type safety, and user experience.

## 🏗️ Core Framework

### Next.js 14+ (App Router)
- **Purpose**: React framework for production-ready applications
- **Features Used**:
  - App Router for file-based routing
  - Server Components for performance optimization
  - Client Components for interactivity
  - Built-in image optimization
  - Static generation and server-side rendering
  - API routes (minimal usage, backend handles most APIs)

### React 18+
- **Purpose**: UI library for building user interfaces
- **Features Used**:
  - Functional components with hooks
  - Context API for theme management
  - Suspense for loading states
  - Concurrent features for better UX

## 🎨 Styling & Design

### Tailwind CSS
- **Purpose**: Utility-first CSS framework
- **Features Used**:
  - Responsive design utilities
  - Custom theme configuration
  - Dark/light mode support
  - Component variants and combinations
  - Performance optimizations (purging unused styles)

### Brutal Design System
- **Purpose**: Custom design language for dating app
- **Characteristics**:
  - Bold, high-contrast elements
  - Thick borders (4px+)
  - Vibrant color palette
  - Prominent shadows and depth
  - Sharp, geometric shapes

### PostCSS
- **Purpose**: CSS processing and optimization
- **Plugins Used**:
  - `tailwindcss` for utility generation
  - `autoprefixer` for browser compatibility

## 🔧 Development & Build Tools

### TypeScript
- **Purpose**: Type-safe JavaScript development
- **Configuration**: Strict mode with comprehensive type checking
- **Benefits**: 
  - Compile-time error detection
  - Better IDE support and autocomplete
  - Improved code maintainability

### ESLint
- **Purpose**: Code linting and quality enforcement
- **Configuration**: Next.js recommended rules with custom additions
- **Rules**: Enforces React hooks rules, TypeScript best practices

### Prettier
- **Purpose**: Code formatting for consistency
- **Configuration**: Standard settings with minor customizations

## 📊 State Management

### Redux Toolkit
- **Purpose**: Predictable state container for JavaScript apps
- **Features Used**:
  - `createSlice` for reducer logic
  - `createAsyncThunk` for async operations
  - RTK Query for data fetching (planned)
  - DevTools integration for debugging

### React Context
- **Purpose**: Component-level state sharing
- **Usage**: 
  - `AuthContext` for authentication state
  - `ThemeProvider` for theme management

## 🌐 HTTP & Real-time Communication

### Axios
- **Purpose**: HTTP client for API requests
- **Features Used**:
  - Request/response interceptors
  - Automatic JSON parsing
  - Error handling middleware
  - Token management for authentication

### Socket.io Client
- **Purpose**: Real-time communication for chat features
- **Features Used**:
  - Event-based messaging
  - Room management for private chats
  - Connection state management
  - Automatic reconnection

## 🎯 UI Components & Libraries

### Radix UI Primitives
- **Purpose**: Unstyled, accessible UI components
- **Components Used**:
  - `@radix-ui/react-slot` for component composition
  - `@radix-ui/react-radio-group` for selection inputs
  - Additional primitives for complex interactions

### Sonner
- **Purpose**: Modern toast notification system
- **Features Used**:
  - Promise-based toast notifications
  - Loading, success, and error states
  - Customizable styling with Tailwind
  - Accessibility support

### Lucide React
- **Purpose**: Beautiful icon library
- **Usage**: Consistent iconography throughout the app

## 🔐 Authentication & Security

### js-cookie
- **Purpose**: Cookie management for authentication
- **Usage**: Secure storage of JWT tokens

### JWT (JSON Web Tokens)
- **Purpose**: Stateless authentication
- **Implementation**: Token stored in HTTP-only cookies for security

## 📱 Mobile & Progressive Web App

### Next.js PWA (Planned)
- **Purpose**: Progressive Web App capabilities
- **Features**: Offline support, installability, push notifications




## 📦 Package Management

### npm
- **Purpose**: Package manager and script runner
- **Scripts**: Development, build, testing, and deployment commands

## 🔧 Configuration Files

### `next.config.ts`
```typescript
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'], // Cloudinary image optimization
  },
  experimental: {
    // Enable experimental features as needed
  },
}
```


## 🔄 Development Workflow

### 1. Component Development
```bash
# Start development server
npm run dev

# Create new component
touch src/components/ui/new-component.tsx

# Test component in Storybook (planned)
npm run storybook
```

### 2. State Management
```bash
# Create new Redux slice
touch src/store/slices/newSlice.ts

# Add to store configuration
# Update src/store/index.ts
```

### 3. Styling
```bash
# Add new Tailwind utilities
# Update tailwind.config.js

# Check for unused styles
npx tailwindcss-cli build --purge
```

## 🚀 Performance Optimizations

1. **Next.js Image Optimization**: Automatic image resizing and format optimization
2. **Code Splitting**: Automatic route-based code splitting
3. **Bundle Analysis**: `@next/bundle-analyzer` for monitoring bundle size
4. **Lazy Loading**: Components and routes loaded on demand
5. **Static Generation**: Pre-render pages where possible
6. **Tree Shaking**: Remove unused code automatically

This tech stack provides a modern, scalable foundation for building a high-performance dating application with excellent user experience across all devices.