import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { profileApi, User, UpdateProfileRequest, Gender } from '@/lib/api';

interface ProfileUpdateData {
  age?: number;
  gender?: Gender;
  bio?: string;
  interests?: string[];
  latitude?: number;
  longitude?: number;
  minAge?: number;
  maxAge?: number;
  interestedInGender?: Gender | Gender[];
  profilePictureUrl: string; // Required in backend
}

interface ProfileState {
  profile: User | null;
  loading: boolean;
  updating: boolean;
  uploadingImage: boolean;
  error: string | null;
  isEditing: boolean;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  updating: false,
  uploadingImage: false,
  error: null,
  isEditing: false,
};

// Async thunks
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileApi.getProfile();
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData: ProfileUpdateData, { rejectWithValue }) => {
    try {
      const response = await profileApi.updateProfile(profileData);
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const uploadProfileImage = createAsyncThunk(
  'profile/uploadImage',
  async (imageFile: File, { rejectWithValue }) => {
    try {
      const response = await profileApi.uploadProfilePhoto(imageFile);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload image');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setEditing: (state, action: PayloadAction<boolean>) => {
      state.isEditing = action.payload;
    },
    updateProfileField: (state, action: PayloadAction<{ field: keyof User; value: any }>) => {
      if (state.profile) {
        const { field, value } = action.payload;
        (state.profile as any)[field] = value;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    resetProfile: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch profile
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.profile = action.payload;
        state.isEditing = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });

    // Upload image
    builder
      .addCase(uploadProfileImage.pending, (state) => {
        state.uploadingImage = true;
        state.error = null;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.uploadingImage = false;
        if (state.profile) {
          state.profile.profilePictureUrl = action.payload.url;
          state.profile = action.payload.user;
        }
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.uploadingImage = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setEditing,
  updateProfileField,
  clearError,
  resetProfile,
} = profileSlice.actions;

export default profileSlice.reducer;