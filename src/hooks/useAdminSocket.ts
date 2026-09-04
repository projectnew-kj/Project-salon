import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Config } from '../constants/Config';
import { useAdminAuthStore } from '../store/useAdminAuthStore';
import { useAdminBookingStore } from '../store/useAdminBookingStore';
import { useLanguageStore } from '../store/useLanguageStore';

export const useAdminSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { accessToken, isAuthenticated } = useAdminAuthStore();
  const { handleNewBooking, handleStatusUpdate } = useAdminBookingStore();
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    let socket: Socket;

    try {
      socket = io(Config.SOCKET_URL, {
        auth: { token: accessToken },
        // Allow a fallback transport. Some production hosts/CDNs/proxies
        // do not support WebSocket upgrades correctly.
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        timeout: 10000,
      });
    } catch {
      // Socket.IO must never be able to crash the admin UI.
      return;
    }

    socketRef.current = socket;

    socket.on('connect', () => {
      // Connected to admin room automatically via handshake role.
    });

    socket.on('booking:created', (newBooking) => {
      try {
        handleNewBooking(newBooking);
      } catch {
        // Ignore malformed real-time payloads.
      }
    });

    socket.on('booking:status_updated', (updatedData) => {
      try {
        handleStatusUpdate(updatedData);
      } catch {
        // Ignore malformed real-time payloads.
      }
    });

    socket.on('connect_error', () => {
      // Real-time updates are optional. Keep the app usable and make sure
      // English remains the safe language when the live backend is down.
      void setLanguage('en');
    });

    socket.on('error', () => {
      // Do not propagate Socket.IO errors into React Native.
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [
    isAuthenticated,
    accessToken,
    handleNewBooking,
    handleStatusUpdate,
    setLanguage,
  ]);

  return socketRef.current;
};
