'use client';

import { useState, useEffect, useRef, FormEvent, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/GuestContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatListItem {
  _id: string;
  title: string;
  updatedAt: string;
}

const SUGGESTED = [
  'How do I become an AI Engineer?',
  'Should I choose AI or Cybersecurity?',
  'What skills are needed for Data Science?',
  'Give me a roadmap for Full Stack Development',
];

function ChatContent() {
  const searchParams = useSearchParams();
  const presetQuery = searchParams.get('q');
  const { token } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatList, setChatList] = useState<ChatListItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [presetSent, setPresetSent] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgIdCounter = useRef(0);

  const nextId = () => `msg-${++msgIdCounter.current}-${Date.now()}`;

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  useEffect(() => { scrollToBottom(); }, [messages.length]);

  useEffect(() => {
    if (!token) return;
    fetchChatList();
  }, [token]);

  useEffect(() => {
    if (presetQuery && !presetSent) {
      setPresetSent(true);
      sendMessage(presetQuery);
    }
  }, [presetQuery]);

  async function fetchChatList() {
    try {
      const res = await fetch('/api/chat', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setChatList(data.data || []);
    } catch {}
  }

  async function sendMessage(text: string) {
    const msg = text.trim();
    if (!msg || loading) return;

    setError('');
    setInput('');

    const userMsg: ChatMessage = { id: nextId(), role: 'user', content: msg, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: msg, chatId: activeChatId }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Failed to get response');
        setLoading(false);
        return;
      }

      const assistantMsg: ChatMessage = {
        id: nextId(),
        role: 'assistant',
        content: data.reply || 'I could not generate a response right now.',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (data.chatId && data.chatId !== activeChatId) {
        setActiveChatId(data.chatId);
        fetchChatList();
      }
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handlePrompt(prompt: string) {
    sendMessage(prompt);
  }

  function newChat() {
    setActiveChatId(null);
    setMessages([]);
    setError('');
    setInput('');
  }

  async function loadChat(id: string) {
    newChat();
    setActiveChatId(id);
    try {
      const res = await fetch(`/api/chat?id=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data?.messages) {
        setMessages(data.data.messages.map((m: any) => ({
          id: m._id || nextId(),
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp).getTime(),
        })));
      }
    } catch {}
  }

  return (
    <div className="flex gap-3 min-h-[70vh]">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-56 shrink-0' : 'w-0 overflow-hidden'} transition-all duration-300`}>
        <Card className="h-full bg-surface-container/50 border-border/50 flex flex-col py-0 gap-0">
          <div className="p-3 border-b border-border/50">
            <Button size="sm" onClick={newChat} className="w-full bg-primary-container text-on-primary-container hover:bg-primary-container/90 text-xs justify-center">
              + New Chat
            </Button>
          </div>
          <CardContent className="flex-1 overflow-y-auto p-2 space-y-1">
            {chatList.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No chats yet</p>
            ) : (
              chatList.map((chat) => (
                <button key={chat._id} onClick={() => { loadChat(chat._id); if (window.innerWidth < 768) setSidebarOpen(false); }}
                  className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${activeChatId === chat._id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-surface-variant/50 hover:text-foreground'}`}>
                  <p className="truncate font-medium">{chat.title}</p>
                  <p className="text-[10px] opacity-50 mt-0.5">{new Date(chat.updatedAt).toLocaleDateString()}</p>
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Toggle sidebar */}
      <button onClick={() => setSidebarOpen((v) => !v)}
        className="shrink-0 h-8 w-8 mt-1 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-surface-variant/50 self-start">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
        </svg>
      </button>

      {/* Main chat */}
      <Card className="flex-1 bg-surface-container/50 border-border/50 flex flex-col overflow-hidden py-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <h1 className="text-sm font-semibold text-foreground">AI Career Assistant</h1>
          </div>
          <span className="text-[10px] text-muted-foreground">Online</span>
        </div>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
          {messages.length === 0 && !loading && !error ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="text-xl text-primary font-semibold">AI</span>
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">How can I help you?</h2>
                <p className="text-xs text-muted-foreground mt-1">Ask me anything about careers and skills.</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {SUGGESTED.map((prompt, i) => (
                  <button key={i} onClick={() => handlePrompt(prompt)}
                    className="px-3 py-2 rounded-lg bg-surface-dim border border-border/50 text-xs text-muted-foreground hover:border-primary/30 hover:text-primary transition-all">
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2.5 rounded-xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-surface-variant/60 text-foreground border border-border/30 rounded-bl-md'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground/50'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-surface-variant/60 border border-border/30 rounded-xl rounded-bl-md px-4 py-3 flex items-center gap-2.5">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
                <span className="text-xs text-muted-foreground">AI is thinking</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex justify-center">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2 flex items-center gap-2">
                <span className="text-xs text-destructive">{error}</span>
                <button onClick={() => setError('')} className="text-xs text-destructive/70 hover:text-destructive underline">Dismiss</button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2 px-4 py-3 border-t border-border/50 shrink-0">
          <Input value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about careers, skills, or guidance..."
            className="bg-surface-dim border-border/50 flex-1" disabled={loading} />
          <Button type="submit" disabled={!input.trim() || loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90">Send</Button>
        </form>
      </Card>
    </div>
  );
}

export const dynamic = 'force-dynamic';

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" /></div>}>
      <ChatContent />
    </Suspense>
  );
}
