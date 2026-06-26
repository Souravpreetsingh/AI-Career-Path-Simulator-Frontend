'use client';

import { Suspense, useState, useEffect, useRef, FormEvent, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { animate } from 'animejs';
import { useAuth } from '@/contexts/GuestContext';
import { useChatHistory, useSendMessage } from '@/hooks/useChat';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pageRef = usePageEnter();

  const { data: prompts } = usePrompts();
  const sendMutation = useSendMessage();

  const socket = useChatSocket(token);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    setWsConnected(socket.connected);
  }, [socket.connected]);

  useEffect(() => {
    const unsub = socket.onNewMessage((data) => {
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.assistantMessage?.content || 'Let me provide some guidance on that.',
        timestamp: new Date().toISOString(),
        id: `msg-${Date.now()}`,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (data.chatId) setActiveChatId(data.chatId);
    });
    return unsub;
  }, [socket]);

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
      socket.sendMessage(text, activeChatId || undefined);
      return;
    }

    try {
      const result = await sendMutation.mutateAsync({ message: text, chatId: activeChatId || undefined });
      const assistantMsg: Message = {
        role: 'assistant',
        content: result.assistantMessage?.content || 'Let me provide some guidance on that.',
        timestamp: new Date().toISOString(),
        id: `msg-${Date.now()}`,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (result.chatId && !activeChatId) setActiveChatId(result.chatId);
    } catch {
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
    <div ref={pageRef} className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold gradient-text">AI Career Assistant</h1>
          {wsConnected && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Connected" />}
        </div>
        <Button variant="outline" size="sm" onClick={newChat} className="text-xs border-border/50">New Chat</Button>
      </div>

      <Card className="flex-1 bg-surface-container/50 border-border/50 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
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
                    className="prompt-btn px-4 py-2 rounded-full bg-surface-dim border border-border/50 text-sm text-muted-foreground hover:border-primary/30 hover:text-primary transition-all">
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={msg.id || i} className={`message-bubble flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary-container/20 text-foreground border border-primary/20'
                    : 'bg-surface-variant/50 text-foreground border border-border/30'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {sendMutation.isPending && !wsConnected && (
            <div className="flex justify-start">
              <div className="bg-surface-variant/50 border border-border/30 rounded-lg p-3">
                <span className="animate-pulse text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <form onSubmit={handleSubmit} className="p-4 border-t border-border/50 flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about careers, skills, or guidance..."
            className="bg-surface-dim border-border/50 flex-1" disabled={sendMutation.isPending} />
          <Button type="submit" disabled={!input.trim() || sendMutation.isPending}
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
