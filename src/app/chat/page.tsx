'use client';

import { Suspense, useState, useEffect, useRef, FormEvent, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { animate } from 'animejs';
import { useAuth } from '@/contexts/GuestContext';
import { useChatHistory, useChat, useSendMessage, useDeleteChat } from '@/hooks/useChat';
import { usePrompts } from '@/hooks/useRecommendations';
import { useChatSocket } from '@/hooks/useSocket';
import { usePageEnter } from '@/hooks/useAnimatedMount';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  id?: string;
}

function ChatContent() {
  const searchParams = useSearchParams();
  const presetQuery = searchParams.get('q');
  const { token } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [presetSent, setPresetSent] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pageRef = usePageEnter();

  const { data: prompts } = usePrompts();
  const { data: chatList, isLoading: listLoading } = useChatHistory();
  const { data: chatData, isLoading: chatLoading } = useChat(activeChatId || '');
  const sendMutation = useSendMessage();
  const deleteChat = useDeleteChat();

  const socket = useChatSocket(token);
  const [wsConnected, setWsConnected] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);

  useEffect(() => {
    setWsConnected(socket.connected);
  }, [socket.connected]);

  useEffect(() => {
    if (activeChatId && wsConnected) {
      socket.joinChat(activeChatId);
    }
  }, [activeChatId, wsConnected, socket]);

  useEffect(() => {
    const unsubHistory = socket.onChatHistory((data) => {
      if (data?.messages) {
        setMessages(data.messages.map((m: any) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
          id: m._id || `msg-${Date.now()}-${Math.random()}`,
        })));
      }
    });
    const unsubTyping = socket.onAiTyping((data) => {
      setAiThinking(data.isTyping);
    });
    const unsubMsg = socket.onNewMessage((data) => {
      setAiThinking(false);
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.assistantMessage?.content || 'Let me provide some guidance on that.',
        timestamp: new Date().toISOString(),
        id: `msg-${Date.now()}`,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (data.chatId) setActiveChatId(data.chatId);
    });
    return () => { unsubHistory(); unsubTyping(); unsubMsg(); };
  }, [socket]);

  const chatDataRef = useRef<string | null>(null);
  useEffect(() => {
    if (chatData?.messages && chatData._id !== chatDataRef.current) {
      chatDataRef.current = chatData._id;
      setMessages(chatData.messages.map((m: any) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        id: m._id || `msg-${Date.now()}-${Math.random()}`,
      })));
    }
  }, [chatData]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    scrollToBottom();
    const lastMsg = messagesEndRef.current?.previousElementSibling;
    if (lastMsg) {
      animate(lastMsg, { opacity: [0, 1], translateY: [12, 0], duration: 300, easing: 'easeOutCubic' });
    }
  }, [messages.length]);

  useEffect(() => {
    if (presetQuery && !presetSent) {
      setPresetSent(true);
      handleSend(presetQuery);
    }
  }, [presetQuery]);

  const doSend = useCallback(async (text: string) => {
    if (!text.trim() || sendMutation.isPending) return;

    const userMsg: Message = { role: 'user', content: text, timestamp: new Date().toISOString(), id: `msg-${Date.now()}` };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    if (wsConnected) {
      setAiThinking(true);
      socket.sendMessage(text, activeChatId || undefined);
      return;
    }

    setAiThinking(true);
    try {
      const result = await sendMutation.mutateAsync({ message: text, chatId: activeChatId || undefined });
      setAiThinking(false);
      const assistantMsg: Message = {
        role: 'assistant',
        content: result.assistantMessage?.content || 'Let me provide some guidance on that.',
        timestamp: new Date().toISOString(),
        id: `msg-${Date.now()}`,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (result.chatId && !activeChatId) setActiveChatId(result.chatId);
    } catch {
      setAiThinking(false);
      setMessages((prev) => prev.slice(0, -1));
    }
  }, [sendMutation, wsConnected, socket, activeChatId]);

  async function handleSend(message?: string) {
    await doSend(message || input);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    doSend(input);
  }

  function newChat() {
    setActiveChatId(null);
    setMessages([]);
  }

  const displayPrompts = prompts && prompts.length > 0 ? prompts : [
    'How do I become an AI Engineer?', 'What skills are in demand for 2026?',
    'How do I transition to data science?', 'What certifications should I pursue?',
    'How to prepare for a technical interview?', 'What is the best career path for me?',
  ];

  return (
    <div ref={pageRef} className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex gap-4">
      <div className={`${showSidebar ? 'w-64 shrink-0' : 'w-0 overflow-hidden'} transition-all duration-300 ease-out`}>
        <Card className="h-full bg-surface-container/50 border-border/50 flex flex-col">
          <CardContent className="p-3 flex-1 overflow-y-auto space-y-1">
            <Button size="sm" onClick={newChat} className="w-full mb-3 bg-primary-container text-on-primary-container hover:bg-primary-container/90 text-xs justify-start gap-2">
              + New Chat
            </Button>
            {listLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-8 rounded bg-surface-dim animate-pulse" />)}
              </div>
            ) : chatList && chatList.length > 0 ? (
              chatList.map((chat: any) => (
                <button key={chat._id} onClick={() => { setActiveChatId(chat._id); if (window.innerWidth < 768) setShowSidebar(false); }}
                  className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${activeChatId === chat._id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-surface-variant/50 hover:text-foreground'}`}>
                  <p className="truncate font-medium">{chat.title}</p>
                  <p className="text-[10px] opacity-60">{new Date(chat.updatedAt).toLocaleDateString()}</p>
                </button>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No chats yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Button variant="ghost" size="icon" onClick={() => setShowSidebar((v) => !v)}
        className="shrink-0 h-8 w-8 mt-1 text-muted-foreground hover:text-foreground self-start hidden md:flex">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showSidebar ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
        </svg>
      </Button>

      <Card className="flex-1 bg-surface-container/50 border-border/50 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold gradient-text">AI Career Assistant</h1>
            {wsConnected && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Connected" />}
          </div>
        </div>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !chatLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="text-2xl text-primary">AI</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">How can I help you?</h2>
                <p className="text-sm text-muted-foreground mt-1">Ask me anything about careers, skills, or growth.</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {displayPrompts.map((prompt: string, i: number) => (
                  <button key={i} onClick={() => doSend(prompt)}
                    className="px-4 py-2 rounded-full bg-surface-dim border border-border/50 text-sm text-muted-foreground hover:border-primary/30 hover:text-primary transition-all">
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : chatLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-lg bg-surface-dim animate-pulse" />)}
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={msg.id || i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary-container/20 text-foreground border border-primary/20 rounded-br-sm'
                    : 'bg-surface-variant/50 text-foreground border border-border/30 rounded-bl-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))
          )}
          {aiThinking && (
            <div className="flex justify-start">
              <div className="bg-surface-variant/50 border border-border/30 rounded-lg rounded-bl-sm p-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm text-muted-foreground">AI is thinking</span>
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0s' }} />
                  <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.3s' }} />
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <form onSubmit={handleSubmit} className="p-4 border-t border-border/50 flex gap-2 shrink-0">
          <Input value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about careers, skills, or guidance..."
            className="bg-surface-dim border-border/50 flex-1" disabled={sendMutation.isPending || aiThinking} />
          <Button type="submit" disabled={!input.trim() || sendMutation.isPending || aiThinking}
            className="bg-primary-container text-on-primary-container hover:bg-primary-container/90">Send</Button>
        </form>
      </Card>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" /></div>}>
      <ChatContent />
    </Suspense>
  );
}
