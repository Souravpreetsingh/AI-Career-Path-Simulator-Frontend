'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';

export function useChatSocket(token: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;
    const socket = io(`${SOCKET_BASE}/chat`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [token]);

  const sendMessage = useCallback((message: string, chatId?: string) => {
    socketRef.current?.emit('sendMessage', { message, chatId });
  }, []);

  const onNewMessage = useCallback((handler: (data: any) => void) => {
    socketRef.current?.on('newMessage', handler);
    return () => { socketRef.current?.off('newMessage', handler); };
  }, []);

  const joinChat = useCallback((chatId: string) => {
    socketRef.current?.emit('joinChat', chatId);
  }, []);

  const onChatHistory = useCallback((handler: (data: any) => void) => {
    socketRef.current?.on('chatHistory', handler);
    return () => { socketRef.current?.off('chatHistory', handler); };
  }, []);

  const sendTyping = useCallback((chatId: string, isTyping: boolean) => {
    socketRef.current?.emit('typing', { chatId, isTyping });
  }, []);

  const onError = useCallback((handler: (data: any) => void) => {
    socketRef.current?.on('error', handler);
    return () => { socketRef.current?.off('error', handler); };
  }, []);

  return { connected, sendMessage, onNewMessage, joinChat, onChatHistory, sendTyping, onError };
}

export function useDashboardSocket(token: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;
    const socket = io(`${SOCKET_BASE}/dashboard`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [token]);

  const getStats = useCallback(() => {
    socketRef.current?.emit('getStats');
  }, []);

  const getActivity = useCallback(() => {
    socketRef.current?.emit('getActivity');
  }, []);

  const getRecommendations = useCallback(() => {
    socketRef.current?.emit('getRecommendations');
  }, []);

  const onStats = useCallback((handler: (data: any) => void) => {
    socketRef.current?.on('stats', handler);
    return () => { socketRef.current?.off('stats', handler); };
  }, []);

  const onActivity = useCallback((handler: (data: any) => void) => {
    socketRef.current?.on('activity', handler);
    return () => { socketRef.current?.off('activity', handler); };
  }, []);

  const onRecommendations = useCallback((handler: (data: any) => void) => {
    socketRef.current?.on('recommendations', handler);
    return () => { socketRef.current?.off('recommendations', handler); };
  }, []);

  const onError = useCallback((handler: (data: any) => void) => {
    socketRef.current?.on('error', handler);
    return () => { socketRef.current?.off('error', handler); };
  }, []);

  return { connected, getStats, getActivity, getRecommendations, onStats, onActivity, onRecommendations, onError };
}
