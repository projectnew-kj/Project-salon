import { create } from 'zustand';
import apiClient from '../api/apiClient';

export interface BookingItem {
  _id: string;
  bookingCode: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  itemType: 'HAIRCUT' | 'OFFER_PACKAGE';
  haircut?: { name: string; price: number; durationMinutes: number };
  offer?: { title: string; offerPrice: number };
  bookingDate: string;
  bookingTime: string;
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'Rejected';
  createdAt: string;
}

interface AdminBookingState {
  bookings: BookingItem[];
  isLoading: boolean;
  fetchBookings: (filters?: Record<string, any>) => Promise<void>;
  updateStatus: (bookingId: string, status: string, note?: string) => Promise<void>;
  handleNewBooking: (booking: BookingItem) => void;
  handleStatusUpdate: (data: { bookingId: string; status: string }) => void;
}

export const useAdminBookingStore = create<AdminBookingState>((set, get) => ({
  bookings: [],
  isLoading: false,

  fetchBookings: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/admin/bookings', { params: filters });
      set({ bookings: res.data.data, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  updateStatus: async (bookingId: string, status: string, note = '') => {
    await apiClient.patch(`/admin/bookings/${bookingId}/status`, { status, note });
    get().handleStatusUpdate({ bookingId, status });
  },

  handleNewBooking: (newBooking: BookingItem) => {
    set((state) => ({
      bookings: [newBooking, ...state.bookings.filter((b) => b._id !== newBooking._id)],
    }));
  },

  handleStatusUpdate: ({ bookingId, status }: { bookingId: string; status: string }) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b._id === bookingId ? { ...b, status: status as any } : b
      ),
    }));
  },
}));