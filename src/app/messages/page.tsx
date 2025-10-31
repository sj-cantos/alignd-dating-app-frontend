'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { matchesApi, MatchUser, chatApi } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Send, Users, MessageCircle } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

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
  match: MatchUser;
  lastMessage?: Message;
  unreadCount: number;
}

export default function Messages() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedMatchId = searchParams.get('match');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  // Connect socket when user is available
  useEffect(() => {
    if (!user) return;
    const token = Cookies.get('token');
    if (!token) return;
    const s = io('http://localhost:8000/chat', {
      transports: ['websocket'],
      auth: { token },
    });
    setSocket(s);
    s.on('connect_error', (err) => {
      console.error('Socket connect error', err);
    });
    s.on('message', (msg: Message) => {
      const currentTargetId = selectedConversation?.match.id;
      if (!currentTargetId) return;
      const involves = msg.senderId === currentTargetId || msg.receiverId === currentTargetId;
      if (!involves) return;
      setMessages((prev) => {
        // de-dupe by id
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      // update last message for conversation list
      setConversations((prev) => prev.map((c) => c.matchId === currentTargetId ? { ...c, lastMessage: msg } : c));
    });
    return () => { s.disconnect(); setSocket(null); };
  }, [user]);

  // Join current room when a conversation is selected and socket is connected
  useEffect(() => {
    if (!socket || !selectedConversation) return;
    socket.emit('join', { targetUserId: selectedConversation.match.id });
  }, [socket, selectedConversation]);

  useEffect(() => {
    if (selectedMatchId && conversations.length > 0) {
      const conversation = conversations.find(c => c.matchId === selectedMatchId);
      if (conversation) {
        setSelectedConversation(conversation);
        loadMessages(conversation.matchId);
      }
    }
  }, [selectedMatchId, conversations]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      // For now, we'll use the matches API and simulate conversations
      const matches = await matchesApi.getMatches();
      const mockConversations: Conversation[] = matches.map(match => ({
        matchId: match.id,
        match,
        lastMessage: {
          id: `last-${match.id}`,
          senderId: match.id,
          receiverId: user?.id || '',
          content: `Hey ${user?.name}! Thanks for the match 😊`,
          timestamp: new Date().toISOString(),
          isRead: Math.random() > 0.5,
        },
        unreadCount: Math.floor(Math.random() * 3),
      }));
      setConversations(mockConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (targetUserId: string) => {
    try {
      const { messages } = await chatApi.getHistory(targetUserId);
      setMessages(messages as any);
    } catch (e) {
      console.error('Failed to load messages', e);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    try {
      setSendingMessage(true);
      const targetUserId = selectedConversation.match.id;
      const outgoing = newMessage;
      setNewMessage('');
      // ensure joined
      socket?.emit('join', { targetUserId });
      // send message; rely on server echo to render, avoiding duplicates
      socket?.emit('message', { targetUserId, content: outgoing });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireCompleteProfile={true}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="bg-card border-brutal border-border shadow-brutal-lg p-8">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-border border-t-primary"></div>
              <p className="font-black text-xl text-foreground">Loading conversations...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireCompleteProfile={true}>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                onClick={() => router.push('/matches')}
                variant="outline"
                className="bg-card border-brutal border-border shadow-brutal hover:shadow-brutal-lg transition-all duration-200 font-bold transform -rotate-1"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Matches
              </Button>
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl font-black text-foreground mb-2 transform -rotate-1">
                💬 MESSAGES 💬
              </h1>
              <p className="text-xl font-bold text-secondary-foreground bg-secondary inline-block px-4 py-2 border-2 border-border transform rotate-1">
                Chat with your matches!
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card border-brutal border-border shadow-brutal h-full overflow-hidden">
                <div className="bg-primary border-b-brutal border-border p-4">
                  <h2 className="font-black text-primary-foreground text-lg">CONVERSATIONS</h2>
                </div>
                
                <div className="overflow-y-auto h-full">
                  {conversations.length > 0 ? (
                    conversations.map((conversation) => (
                      <button
                        key={conversation.matchId}
                        onClick={() => {
                          setSelectedConversation(conversation);
                          loadMessages(conversation.matchId);
                        }}
                        className={`w-full p-4 border-b-2 border-border text-left hover:bg-muted transition-colors ${
                          selectedConversation?.matchId === conversation.matchId ? 'bg-accent' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-pink-bright/20 to-primary/20 border-2 border-border flex items-center justify-center">
                            {conversation.match.profilePictureUrl ? (
                              <img
                                src={conversation.match.profilePictureUrl}
                                alt={conversation.match.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users size={20} className="text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-foreground truncate">{conversation.match.name}</p>
                              {conversation.unreadCount > 0 && (
                                <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                            {conversation.lastMessage && (
                              <p className="text-sm text-muted-foreground truncate">
                                {conversation.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <MessageCircle size={60} className="mx-auto mb-4 text-muted-foreground" />
                      <p className="font-bold text-muted-foreground">No conversations yet</p>
                      <p className="text-sm text-muted-foreground mt-2">Start matching to begin chatting!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2">
              <div className="bg-card border-brutal border-border shadow-brutal h-full flex flex-col">
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="bg-accent border-b-brutal border-border p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-bright/20 to-primary/20 border-2 border-border flex items-center justify-center">
                          {selectedConversation.match.profilePictureUrl ? (
                            <img
                              src={selectedConversation.match.profilePictureUrl}
                              alt={selectedConversation.match.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users size={16} className="text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-black text-accent-foreground">{selectedConversation.match.name}</h3>
                          <p className="text-accent-foreground/80 text-sm">Online now</p>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user?.id ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 border-2 border-border shadow-brutal ${
                              message.senderId === user?.id
                                ? 'bg-card text-foreground'
                                : 'bg-primary text-primary-foreground'
                            }`}
                          >
                            <p className="font-medium">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.senderId === user?.id ? 'text-muted-foreground' : 'text-primary-foreground/80'
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="border-t-brutal border-border p-4">
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type a message..."
                          className="flex-1 border-brutal border-border font-medium bg-background shadow-brutal-sm focus:shadow-brutal transition-all duration-200"
                          disabled={sendingMessage}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || sendingMessage}
                          className="bg-success hover:bg-success/90 text-success-foreground border-brutal border-border shadow-brutal hover:shadow-brutal-lg transition-all duration-200 font-black"
                        >
                          <Send size={16} />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle size={80} className="mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-black text-foreground mb-2">Select a Conversation</h3>
                      <p className="text-muted-foreground font-medium">Choose a match to start chatting!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}