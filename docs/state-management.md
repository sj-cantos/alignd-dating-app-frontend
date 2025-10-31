# State Management

Comprehensive guide to state management patterns, Redux store structure, and data flow in the Charmd frontend application.

## 🏗️ State Architecture Overview

The application uses a hybrid approach combining Redux Toolkit for global state and React Context for component-level state management.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Components    │    │  Redux Store    │    │  Local Context  │
│                 │◄──►│                 │◄──►│                 │
│ • UI State      │    │ • Auth State    │    │ • Theme State   │
│ • Form Data     │    │ • Matches       │    │ • Temp Data     │
│ • Temp State    │    │ • Chat          │    │                 │
│                 │    │ • Profile       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Redux Store Configuration

### Store Setup (`src/store/index.ts`)

```typescript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import matchesReducer from './slices/matchesSlice';
import chatReducer from './slices/chatSlice';
import profileReducer from './slices/profileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    matches: matchesReducer,
    chat: chatReducer,
    profile: profileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['chat.socket'], // Ignore socket in serialization
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Typed Hooks (`src/store/hooks.ts`)

```typescript
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

## 🔐 Authentication State (`authSlice.ts`)

Manages user authentication, login state, and user session data.

### State Structure
```typescript
interface AuthState {
  user: User | null;           // Current authenticated user
  token: string | null;        // JWT authentication token
  isAuthenticated: boolean;    // Authentication status
  loading: boolean;           // Loading state for auth operations
  error: string | null;       // Authentication error messages
}
```

### Key Actions
- `login()` - Authenticate user with credentials
- `register()` - Create new user account
- `logout()` - Clear authentication state
- `checkAuthStatus()` - Verify token validity
- `clearError()` - Reset error messages

### Usage Example
```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, selectAuth } from '@/store/slices/authSlice';

function LoginComponent() {
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector(selectAuth);

  const handleLogin = async (credentials: LoginData) => {
    const result = await dispatch(login(credentials));
    if (login.fulfilled.match(result)) {
      // Handle successful login
      router.push('/discover');
    }
  };

  return (
    // Login form JSX
  );
}
```

## 💕 Matches State (`matchesSlice.ts`)

Handles potential matches, user swipes, match results, and match management.

### State Structure
```typescript
interface MatchesState {
  potentialMatches: MatchUser[];    // Cards available for swiping
  currentMatches: MatchUser[];      // Confirmed mutual matches
  loading: boolean;                 // Loading state for match operations
  swiping: boolean;                // Swiping operation in progress
  error: string | null;            // Match-related error messages
  lastSwipeResult: SwipeResult | null; // Result of last swipe action
}
```

### Async Thunks
```typescript
// Fetch potential matches for swiping
export const fetchPotentialMatches = createAsyncThunk(
  'matches/fetchPotentialMatches',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const matches = await matchesApi.getPotentialMatches(limit);
      return matches;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Swipe on a user (like or pass)
export const swipeUser = createAsyncThunk(
  'matches/swipeUser',
  async ({ targetUserId, action }: SwipeRequest, { rejectWithValue }) => {
    try {
      const result = await matchesApi.swipe({ targetUserId, action });
      return { targetUserId, action, result };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
```

### Usage Example
```typescript
function DiscoverPage() {
  const dispatch = useAppDispatch();
  const { potentialMatches, loading, lastSwipeResult } = useAppSelector(
    (state) => state.matches
  );

  useEffect(() => {
    dispatch(fetchPotentialMatches(10));
  }, [dispatch]);

  const handleSwipe = async (userId: string, action: 'like' | 'pass') => {
    const result = await dispatch(swipeUser({ targetUserId: userId, action }));
    
    if (swipeUser.fulfilled.match(result) && result.payload.result.isMatch) {
      // Show match notification
      toast.success("It's a match! 🎉");
    }
  };

  return (
    // Swipe cards JSX
  );
}
```

## 💬 Chat State (`chatSlice.ts`)

Manages real-time messaging, conversation history, and socket connections.

### State Structure
```typescript
interface ChatState {
  conversations: Conversation[];              // List of active conversations
  messages: { [conversationId: string]: Message[] }; // Messages by conversation
  activeConversation: string | null;         // Currently open conversation
  loading: boolean;                          // Loading message history
  sendingMessage: boolean;                   // Sending message in progress
  error: string | null;                      // Chat-related errors
  socket: Socket | null;                     // Socket.io connection
}
```

### Real-time Integration
```typescript
// Socket event handlers
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<{ conversationId: string; message: Message }>) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      
      // Avoid duplicates
      const exists = state.messages[conversationId].find(m => m.id === message.id);
      if (!exists) {
        state.messages[conversationId].push(message);
      }
    },
    
    setSocket: (state, action: PayloadAction<Socket>) => {
      state.socket = action.payload;
    },
  },
});
```

### Usage Example
```typescript
function MessagesPage() {
  const dispatch = useAppDispatch();
  const { messages, activeConversation, socket } = useAppSelector(
    (state) => state.chat
  );

  useEffect(() => {
    // Set up socket connection
    const newSocket = io(config.API_BASE_URL, {
      auth: { token: Cookies.get('token') }
    });
    
    dispatch(setSocket(newSocket));
    
    // Listen for new messages
    newSocket.on('newMessage', (message) => {
      dispatch(addMessage({ 
        conversationId: message.senderId, 
        message 
      }));
    });

    return () => newSocket.close();
  }, [dispatch]);

  return (
    // Chat interface JSX
  );
}
```

## 👤 Profile State (`profileSlice.ts`)

Manages user profile data, profile editing, and image uploads.

### State Structure
```typescript
interface ProfileState {
  profile: User | null;        // Current user's complete profile
  loading: boolean;           // Loading profile data
  updating: boolean;          // Profile update in progress
  uploadingImage: boolean;    // Image upload in progress
  error: string | null;       // Profile-related errors
  isEditing: boolean;        // Profile edit mode toggle
}
```

### Profile Operations
```typescript
// Update profile information
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData: ProfileUpdateData, { rejectWithValue }) => {
    try {
      const response = await profileApi.updateProfile(profileData);
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Upload profile image
export const uploadProfileImage = createAsyncThunk(
  'profile/uploadImage',
  async (imageFile: File, { rejectWithValue }) => {
    try {
      const response = await profileApi.uploadProfilePhoto(imageFile);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
```

## 🌍 Context-Based State

### Theme Context (`src/contexts/ThemeContext.tsx`)

Manages application theme (dark/light mode) using React Context.

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### Auth Context (`src/contexts/AuthContext.tsx`)

Provides authentication utilities and user session management.

```typescript
interface AuthContextType {
  user: User | null;
  login: (credentials: LoginData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading } = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();

  const login = useCallback(async (credentials: LoginData) => {
    await dispatch(loginAsync(credentials));
  }, [dispatch]);

  const logout = useCallback(() => {
    dispatch(logoutAsync());
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 🔄 Data Flow Patterns

### Component → Redux Flow

```typescript
// 1. Component dispatches action
const handleAction = () => {
  dispatch(someAsyncAction(payload));
};

// 2. Async thunk executes
export const someAsyncAction = createAsyncThunk(
  'slice/action',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await api.someEndpoint(payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 3. Reducer updates state
extraReducers: (builder) => {
  builder
    .addCase(someAsyncAction.pending, (state) => {
      state.loading = true;
    })
    .addCase(someAsyncAction.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
    })
    .addCase(someAsyncAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
}

// 4. Component re-renders with new state
const { data, loading, error } = useAppSelector(selectSliceState);
```

### Optimistic Updates Pattern

```typescript
const handleLike = async (userId: string) => {
  // Optimistic update - immediately show liked state
  dispatch(updateMatchOptimistically({ userId, action: 'like' }));
  
  try {
    const result = await dispatch(swipeUser({ targetUserId: userId, action: 'like' }));
    
    if (swipeUser.fulfilled.match(result)) {
      // Confirm the optimistic update
      if (result.payload.result.isMatch) {
        toast.success("It's a match! 🎉");
      }
    }
  } catch (error) {
    // Revert optimistic update on error
    dispatch(revertMatchUpdate({ userId }));
    toast.error("Failed to like user");
  }
};
```

## 🎯 State Selectors

### Memoized Selectors

```typescript
import { createSelector } from '@reduxjs/toolkit';

// Simple selector
export const selectAuth = (state: RootState) => state.auth;

// Memoized selector for computed values
export const selectUserMatches = createSelector(
  [(state: RootState) => state.matches.currentMatches],
  (matches) => matches.filter(match => match.distance <= 50) // Only nearby matches
);

// Selector with parameters
export const selectConversationMessages = (conversationId: string) =>
  createSelector(
    [(state: RootState) => state.chat.messages],
    (messages) => messages[conversationId] || []
  );
```

## 🧪 Testing State Management

### Testing Reducers

```typescript
import { authSlice, AuthState } from '@/store/slices/authSlice';

describe('authSlice', () => {
  const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };

  it('should handle login.pending', () => {
    const action = { type: login.pending.type };
    const state = authSlice.reducer(initialState, action);
    
    expect(state.loading).toBe(true);
    expect(state.error).toBe(null);
  });

  it('should handle login.fulfilled', () => {
    const user = { id: '1', name: 'John', email: 'john@example.com' };
    const action = { 
      type: login.fulfilled.type, 
      payload: { user, access_token: 'token123' }
    };
    const state = authSlice.reducer(initialState, action);
    
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(user);
  });
});
```

### Testing Components with Redux

```typescript
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ProfileComponent } from '@/components/ProfileComponent';

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      profile: profileReducer,
    },
    preloadedState: initialState,
  });
};

test('renders profile component with user data', () => {
  const store = createTestStore({
    auth: {
      user: { id: '1', name: 'John Doe' },
      isAuthenticated: true,
    },
  });

  render(
    <Provider store={store}>
      <ProfileComponent />
    </Provider>
  );

  expect(screen.getByText('John Doe')).toBeInTheDocument();
});
```

## 🔧 Performance Optimization

### Avoiding Unnecessary Re-renders

```typescript
// Use memo for expensive components
const ExpensiveComponent = memo(({ data }: { data: any[] }) => {
  return (
    <div>
      {data.map(item => <Item key={item.id} item={item} />)}
    </div>
  );
});

// Use specific selectors instead of entire state
const Component = () => {
  // ❌ Bad - causes re-render on any state change
  const state = useAppSelector(state => state);
  
  // ✅ Good - only re-renders when matches change
  const matches = useAppSelector(state => state.matches.currentMatches);
  
  return <MatchList matches={matches} />;
};
```

### Debouncing API Calls

```typescript
import { debounce } from 'lodash';

const debouncedSearch = debounce((query: string) => {
  dispatch(searchUsers(query));
}, 300);

const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  debouncedSearch(e.target.value);
};
```

This state management architecture provides a scalable, type-safe foundation for managing complex application state while maintaining good performance and developer experience.