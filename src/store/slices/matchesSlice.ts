import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { matchesApi, MatchUser } from '@/lib/api';

interface MatchesState {
  matches: MatchUser[];
  potentialMatches: MatchUser[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

const initialState: MatchesState = {
  matches: [],
  potentialMatches: [],
  loading: false,
  error: null,
  lastFetch: null,
};

// Async thunks
export const fetchMatches = createAsyncThunk(
  'matches/fetchMatches',
  async (_, { rejectWithValue }) => {
    try {
      const data = await matchesApi.getMatches();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch matches');
    }
  }
);

export const fetchPotentialMatches = createAsyncThunk(
  'matches/fetchPotentialMatches',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const data = await matchesApi.getPotentialMatches(limit);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch potential matches');
    }
  }
);

export const unmatchUser = createAsyncThunk(
  'matches/unmatchUser',
  async (matchId: string, { rejectWithValue }) => {
    try {
      await matchesApi.unmatch(matchId);
      return matchId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unmatch user');
    }
  }
);

export const swipeUser = createAsyncThunk(
  'matches/swipeUser',
  async ({ targetUserId, action }: { targetUserId: string; action: any }, { rejectWithValue }) => {
    try {
      const result = await matchesApi.swipe({ targetUserId, action });
      return { targetUserId, result };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to swipe');
    }
  }
);

const matchesSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    removeMatch: (state, action: PayloadAction<string>) => {
      state.matches = state.matches.filter(match => match.id !== action.payload);
    },
    removePotentialMatch: (state, action: PayloadAction<string>) => {
      state.potentialMatches = state.potentialMatches.filter(match => match.id !== action.payload);
    },
    addMatch: (state, action: PayloadAction<MatchUser>) => {
      const exists = state.matches.find(match => match.id === action.payload.id);
      if (!exists) {
        state.matches.unshift(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch matches
    builder
      .addCase(fetchMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload;
        state.lastFetch = Date.now();
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch potential matches
    builder
      .addCase(fetchPotentialMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPotentialMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.potentialMatches = action.payload;
        state.lastFetch = Date.now();
      })
      .addCase(fetchPotentialMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Unmatch user
    builder
      .addCase(unmatchUser.pending, (state) => {
        state.error = null;
      })
      .addCase(unmatchUser.fulfilled, (state, action) => {
        state.matches = state.matches.filter(match => match.id !== action.payload);
      })
      .addCase(unmatchUser.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Swipe user
    builder
      .addCase(swipeUser.pending, (state) => {
        state.error = null;
      })
      .addCase(swipeUser.fulfilled, (state, action) => {
        const { targetUserId, result } = action.payload;
        // Remove from potential matches after swiping
        state.potentialMatches = state.potentialMatches.filter(match => match.id !== targetUserId);
        
        // If it's a match, we might want to add to matches array
        if (result.isMatch) {
          // The match details would come from the API response
          // This is handled by the UI showing match notification
        }
      })
      .addCase(swipeUser.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, removeMatch, removePotentialMatch, addMatch } = matchesSlice.actions;
export default matchesSlice.reducer;