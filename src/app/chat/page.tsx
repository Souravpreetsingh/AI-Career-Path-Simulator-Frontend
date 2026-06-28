'use client';

import { useState, useEffect, useRef, FormEvent, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/GuestContext';
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

  async function deleteChat(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/chat?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        if (activeChatId === id) newChat();
        fetchChatList();
      }
    } catch {}
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
    <div className="fixed inset-0 z-50 flex bg-background">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} shrink-0 h-full border-r border-border/30 transition-all duration-300 flex flex-col bg-surface-container/80 backdrop-blur-xl`}>
        {sidebarOpen && (
          <>
            {/* New Chat */}
            <div className="p-4 border-b border-border/20">
              <Button onClick={newChat} className="w-full bg-primary/20 text-primary hover:bg-primary/30 text-sm font-medium justify-center rounded-xl h-10">
                + New Chat
              </Button>
            </div>

            {/* Chat history */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {chatList.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10">No chats yet</p>
              ) : (
                chatList.map((chat) => (
                  <div key={chat._id} onClick={() => { loadChat(chat._id); if (window.innerWidth < 768) setSidebarOpen(false); }}
                    className={`group flex items-center gap-1 p-3 rounded-xl text-sm transition-all cursor-pointer ${
                      activeChatId === chat._id
                        ? 'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(167,139,250,0.2)]'
                        : 'text-muted-foreground hover:bg-surface-variant/40 hover:text-foreground'
                    }`}>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{chat.title}</p>
                      <p className="text-[11px] opacity-40 mt-1">{new Date(chat.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={(e) => deleteChat(e, chat._id)}
                      className="opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </nav>

            {/* Profile */}
            <div className="p-4 border-t border-border/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs text-primary font-semibold">G</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">Guest</p>
                  <p className="text-[11px] text-muted-foreground truncate">Free Account</p>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>

      {/* Toggle sidebar */}
      <button onClick={() => setSidebarOpen((v) => !v)}
        className="shrink-0 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-variant/40 transition-colors h-full">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
        </svg>
      </button>

      {/* Main chat area */}
      <main className="flex-1 h-full flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border/30 shrink-0 flex items-center justify-between px-6 bg-surface/40 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(74,222,128,0.4)]" />
            <h1 className="text-base font-semibold text-foreground">AI Career Assistant</h1>
            <span className="text-xs text-green-400/70">Online</span>
          </div>
          <button onClick={newChat} className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg bg-surface-variant/30 hover:bg-surface-variant/50">
            Clear
          </button>
        </header>

        {/* Messages */}
        <section className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && !loading && !error ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_24px_rgba(167,139,250,0.15)]">
                <span className="text-2xl text-primary font-semibold">AI</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">How can I help you?</h2>
                <p className="text-sm text-muted-foreground mt-1">Ask me anything about careers and skills.</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTED.map((prompt, i) => (
                  <button key={i} onClick={() => handlePrompt(prompt)}
                    className="px-4 py-2.5 rounded-xl bg-surface-variant/30 border border-border/40 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all">
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-1 shrink-0">
                    <span className="text-xs text-primary font-semibold">AI</span>
                  </div>
                )}
                <div className={`max-w-[75%] px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md shadow-lg shadow-primary/20'
                    : 'bg-surface-container/70 border border-border/30 text-foreground rounded-2xl rounded-bl-md backdrop-blur-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-[11px] mt-1.5 ${msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground/50'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start items-end gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-xs text-primary font-semibold">AI</span>
              </div>
              <div className="bg-surface-container/70 border border-border/30 rounded-2xl rounded-bl-md px-4 py-3 backdrop-blur-sm">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }} />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex justify-center">
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-5 py-3 flex items-center gap-3 backdrop-blur-sm">
                <span className="text-sm text-destructive">{error}</span>
                <button onClick={() => setError('')} className="text-sm text-destructive/70 hover:text-destructive underline">Dismiss</button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </section>

        {/* Input */}
        <footer className="h-20 border-t border-border/30 shrink-0 backdrop-blur-xl bg-surface/60 px-6 flex items-center">
          <form onSubmit={handleSubmit} className="flex gap-3 w-full">
            <Input value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about careers, skills, or guidance..."
              className="bg-surface-dim/80 border-border/40 flex-1 h-12 rounded-xl text-sm" disabled={loading} />
            <Button type="submit" disabled={!input.trim() || loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 rounded-xl text-sm font-medium">
              Send
            </Button>
          </form>
        </footer>
      </main>
    </div>
  );
}

export const dynamic = 'force-dynamic';

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" /></div>}>
      <ChatContent />
    </Suspense>
  );
}
