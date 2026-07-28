import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    if (!user) return;

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    // Remove /api from baseUrl if it exists to get the server root for socket.io
    const socketUrl = baseUrl.replace(/\/api$/, '');

    socketRef.current = io(socketUrl, {
      path: '/ws/chat',
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current.on('connect', () => {
      console.log('Global Socket connected');
      // Identify this user to receive direct system notifications
      socketRef.current?.emit('identify', user.id);
    });

    // Listen for system notifications
    socketRef.current.on('system_notification', (notification) => {
      console.log('Received real-time system notification:', notification);
      
      addToast({
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        link: notification.link,
      });
      
      // Optionally trigger browser's native notification API if permissions granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, { body: notification.message });
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('Global Socket disconnected');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, addToast]);

  return socketRef.current;
};
