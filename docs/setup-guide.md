# Setup Guide

This guide will help you set up the Charmd frontend for local development.

## 📋 Prerequisites

### Required Software
- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

### Optional but Recommended
- **VS Code** with React/TypeScript extensions
- **React Developer Tools** browser extension
- **Redux DevTools** browser extension

## 🔧 Environment Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd charmd/frontend
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Variables
Create a `.env.local` file in the frontend root directory:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Application Configuration
NEXT_PUBLIC_APP_NAME=Charmd
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development Configuration
NODE_ENV=development
```

### 4. Verify Backend Connection
Ensure the backend is running on `http://localhost:3001` before starting the frontend.

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
# or
yarn dev
```

This starts the development server with hot-reload enabled on `http://localhost:3000`

### Production Build
```bash
npm run build
npm run start
# or
yarn build
yarn start
```

### Type Checking
```bash
npm run type-check
# or
yarn type-check
```

## 🔍 Verification

### Check Application Health
Once the server is running, verify it's working:

1. Open `http://localhost:3000` in your browser
2. You should see the Charmd landing page
3. Navigate to `/auth` to test the authentication forms
4. Check browser console for any errors

### Redux DevTools
1. Install Redux DevTools browser extension
2. Open browser developer tools
3. Look for "Redux" tab to inspect state changes

### Network Requests
1. Open browser Network tab
2. Navigate through the app
3. Verify API calls are reaching `http://localhost:3001`

## 🛠️ Development Tools

### VS Code Extensions
Recommended extensions for optimal development experience:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json"
  ]
}
```

### Browser Extensions
- **React Developer Tools**: Debug React component tree
- **Redux DevTools**: Monitor Redux state changes
- **Lighthouse**: Performance and accessibility auditing

## 📁 Project Structure Overview

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React Context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   ├── store/            # Redux store configuration
│   └── assets/           # Static assets
├── public/               # Public static files
├── docs/                 # Documentation
└── package.json          # Dependencies and scripts
```

## 🎨 Styling Development

### Tailwind CSS
The project uses Tailwind CSS for styling. Key commands:

```bash
# Watch for changes and rebuild CSS
npm run dev  # Automatically includes CSS watching

# Build optimized CSS for production
npm run build
```

### Dark Mode
The app supports dark/light mode:
- Toggle using the theme switcher in the navigation
- Theme preference is saved to localStorage
- CSS variables adapt automatically

### Custom Components
UI components are built using:
- **Radix UI**: Accessible primitives
- **Tailwind CSS**: Utility-first styling
- **CSS Variables**: Theme-aware design tokens

## 🔐 Authentication Setup

### Token Management
The app uses JWT tokens stored in HTTP-only cookies:

```typescript
// Tokens are automatically handled by api.ts
// Check authentication status:
const { isAuthenticated, user } = useAppSelector(selectAuth);
```

### Protected Routes
Routes are protected using the `ProtectedRoute` component:

```typescript
// Automatically redirects to /auth if not authenticated
<ProtectedRoute>
  <PrivatePageContent />
</ProtectedRoute>
```

## 🌐 API Integration

### HTTP Client Configuration
The app uses Axios with automatic token management:

```typescript
// src/lib/api.ts handles:
// - Automatic token attachment
// - Request/response interceptors
// - Error handling
// - Base URL configuration
```

### WebSocket Connection
Real-time features use Socket.io:

```typescript
// Connection established in chat components
const socket = io(config.API_BASE_URL, {
  auth: { token: Cookies.get('token') }
});
```

## 🧪 Testing Setup (When Implemented)

### Unit Testing
```bash
npm run test
# or
yarn test
```

### Component Testing
```bash
npm run test:watch
# or
yarn test:watch
```

### E2E Testing (Planned)
```bash
npm run test:e2e
# or
yarn test:e2e
```

## 🚨 Common Issues

### Port Already in Use
If port 3000 is already in use:
```bash
# Kill process using port
lsof -ti:3000 | xargs kill  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Or change port in package.json
"dev": "next dev -p 3001"
```

### API Connection Issues
- Ensure backend is running on `http://localhost:3001`
- Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- Verify CORS configuration in backend
- Check browser Network tab for failed requests

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev

# Clear node_modules if persistent issues
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Run type checking
npm run type-check

# Common fixes:
# - Update component prop types
# - Check import paths
# - Verify API response types
```

### Styling Issues
```bash
# Rebuild Tailwind CSS
npm run dev  # Restarts with fresh CSS

# Check for:
# - Correct class names
# - Theme variable usage
# - CSS purging in production
```

## 🔄 Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/new-feature

# Start development server
npm run dev

# Make changes with hot reload
# Components auto-refresh on save
```

### 2. Code Quality
```bash
# Run linting
npm run lint

# Format code
npm run format  # If prettier script exists

# Type checking
npm run type-check
```

### 3. Testing Changes
```bash
# Test in different viewports
# Check responsive design
# Verify dark/light mode
# Test authentication flows
```

### 4. Committing Changes
```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature
```

## 📱 Mobile Development

### Responsive Testing
```bash
# Open Chrome DevTools
# Toggle device toolbar (Ctrl+Shift+M)
# Test on various device sizes:
# - iPhone SE (375px)
# - iPhone 12 Pro (390px)
# - iPad (768px)
# - Desktop (1024px+)
```

### Touch Interactions
- Swipe gestures for match cards
- Touch-friendly button sizes (44px minimum)
- Proper tap targets and hover states

## 🚀 Performance Optimization

### Development Monitoring
```bash
# Check bundle size
npm run build
npm run analyze  # If bundle analyzer is configured

# Monitor in browser:
# - Lighthouse performance score
# - Core Web Vitals
# - Network waterfall
```

### Image Optimization
- Use Next.js `Image` component
- Images from Cloudinary are automatically optimized
- Proper `alt` attributes for accessibility

## 📚 Next Steps

Once setup is complete:
1. Review [Tech Stack Documentation](./tech-stack.md)
2. Explore [Component Library](./components.md)
3. Understand [State Management](./state-management.md)
4. Check [File Structure Guide](./file-structure.md)
5. Read [API Integration Guide](./api-integration.md)

## 🆘 Getting Help

If you encounter issues:
1. Check this setup guide thoroughly
2. Review error messages in browser console
3. Check Network tab for API request failures
4. Verify environment variables are set correctly
5. Ensure backend is running and accessible
6. Try clearing cache and rebuilding

The frontend should now be running successfully with full functionality including authentication, real-time chat, and responsive design!