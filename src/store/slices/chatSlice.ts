import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { chatApi } from '@/lib/api';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface Conversation {
  matchId: string;
  match: any; // MatchUser type
  lastMessage?: Message;
  unreadCount: number;
}

interface ChatState {
  conversations: Conversation[];
  messages: { [conversationId: string]: Message[] };
  activeConversation: string | null;
  loading: boolean;
  sendingMessage: boolean;
  error: string | null;
  socket: any; // Socket type
}

const initialState: ChatState = {
  conversations: [],
  messages: {},
  activeConversation: null,
  loading: false,
  sendingMessage: false,
  error: null,
  socket: null,
};

// Async thunks
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      // This would need to be implemented in the API
      // For now, return empty array
      return [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (targetUserId: string, { rejectWithValue }) => {
    try {
      const { messages } = await chatApi.getHistory(targetUserId);
      return { targetUserId, messages };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversation = action.payload;
    },
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
      
      // Update last message in conversation
      const conversation = state.conversations.find(c => c.matchId === conversationId);
      if (conversation) {
        conversation.lastMessage = message;
      }
    },
    setSocket: (state, action: PayloadAction<any>) => {
      state.socket = action.payload;
    },
    clearMessages: (state, action: PayloadAction<string>) => {
      delete state.messages[action.payload];
    },
    setSendingMessage: (state, action: PayloadAction<boolean>) => {
      state.sendingMessage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateConversationUnread: (state, action: PayloadAction<{ conversationId: string; unreadCount: number }>) => {
      const { conversationId, unreadCount } = action.payload;
      const conversation = state.conversations.find(c => c.matchId === conversationId);
      if (conversation) {
        conversation.unreadCount = unreadCount;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch conversations
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch messages
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { targetUserId, messages } = action.payload;
        state.messages[targetUserId] = messages as Message[];
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setActiveConversation,
  addMessage,
  setSocket,
  clearMessages,
  setSendingMessage,
  clearError,
  updateConversationUnread,
} = chatSlice.actions;

export default chatSlice.reducer;