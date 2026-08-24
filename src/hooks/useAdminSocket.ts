import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Config } from '../constants/Config';
import { useAdminAuthStore } from '../store/useAdminAuthStore';
import { useAdminBookingStore } from '../store/useAdminBookingStore';

export const useAdminSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { accessToken, isAuthenticated } = useAdminAuthStore();
  const { handleNewBooking, handleStatusUpdate } = useAdminBookingStore();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(Config.SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      // Connected to admin room automatically via handshake role
    });

    socket.on('booking:created', (newBooking) => {
      handleNewBooking(newBooking);
    });

    socket.on('booking:status_updated', (updatedData) => {
      handleStatusUpdate(updatedData);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, accessToken]);

  return socketRef.current;
};