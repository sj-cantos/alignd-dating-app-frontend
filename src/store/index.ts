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
        ignoredPaths: ['chat.socket'], // Ignore socket in serialization checks
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;