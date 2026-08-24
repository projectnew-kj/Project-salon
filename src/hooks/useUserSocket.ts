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
  const { accessToken, isAuthenticated } = useUserAuthStore();

  useEffect(() => {
    const socket = io(Config.SOCKET_URL, {
      auth: { token: accessToken || '' },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      if (activeBookingId) {
        socket.emit('join:booking', activeBookingId);
      }
    });

    socket.on('booking:status_updated', (data) => {
      if (onBookingStatusUpdated) {
        onBookingStatusUpdated(data);
      }
    });

    socket.on('notification:new', (notification) => {
      if (onNewNotification) {
        onNewNotification(notification);
      }
    });

    return () => {
      if (activeBookingId) {
        socket.emit('leave:booking', activeBookingId);
      }
      socket.disconnect();
    };
  }, [isAuthenticated, accessToken, activeBookingId]);

  return socketRef.current;
};