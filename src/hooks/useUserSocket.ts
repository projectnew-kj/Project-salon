import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Config } from '../constants/Config';
import { useUserAuthStore } from '../store/useUserAuthStore';

interface UseUserSocketProps {
  activeBookingId?: string;
  onBookingStatusUpdated?: (data: { bookingId: string; status: string; statusHistory: any[] }) => void;
  onNewNotification?: (notification: any) => void;
}

export const useUserSocket = ({
  activeBookingId,
  onBookingStatusUpdated,
  onNewNotification,
}: UseUserSocketProps = {}) => {
  const socketRef = useRef<Socket | null>(null);
  const bookingStatusCallbackRef = useRef(onBookingStatusUpdated);
  const notificationCallbackRef = useRef(onNewNotification);

  bookingStatusCallbackRef.current = onBookingStatusUpdated;
  notificationCallbackRef.current = onNewNotification;

  const { accessToken, isAuthenticated } = useUserAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !Config.SOCKET_URL) {
      return;
    }

    let socket: Socket | null = null;

    try {
      socket = io(Config.SOCKET_URL, {
        auth: { token: accessToken },
        // Try websocket first, but allow polling fallback on mobile networks.
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
        timeout: 5000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        if (activeBookingId) {
          socket?.emit('join:booking', activeBookingId);
        }
      });

      socket.on('booking:status_updated', (data) => {
        bookingStatusCallbackRef.current?.(data);
      });

      socket.on('notification:new', (notification) => {
        notificationCallbackRef.current?.(notification);
      });

      // A socket failure must never reject a React effect or block navigation.
      socket.on('connect_error', (error) => {
        console.warn('[Socket.IO] connection unavailable:', error?.message || error);
      });
    } catch (error) {
      console.warn('[Socket.IO] initialization unavailable:', error);
    }

    return () => {
      if (socket) {
        if (activeBookingId && socket.connected) {
          socket.emit('leave:booking', activeBookingId);
        }
        socket.removeAllListeners();
        socket.disconnect();
      }
      socketRef.current = null;
    };
  }, [isAuthenticated, accessToken, activeBookingId]);

  return socketRef.current;
};
