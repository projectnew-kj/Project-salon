export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'
  | 'Rejected';

export interface BookingCustomer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
}

export interface StatusHistoryEntry {
  status: BookingStatus;
  changedBy?: string;
  changedByModel: 'Admin' | 'User' | 'System';
  note: string;
  timestamp: string;
}

export interface Booking {
  _id: string;
  bookingCode: string;
  user: BookingCustomer;
  itemType: 'HAIRCUT' | 'OFFER_PACKAGE';
  haircut?: { _id: string; name: string; price: number; durationMinutes: number; image?: string };
  offer?: { _id: string; title: string; offerPrice: number; image?: string };
  bookingDate: string;
  bookingTime: string;
  durationMinutes: number;
  totalAmount: number;
  status: BookingStatus;
  statusHistory: StatusHistoryEntry[];
  notes: string;
  isReviewed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookingFilters {
  status?: BookingStatus | string;
  date?: string;
  userId?: string;
  search?: string;
  page?: number;
  limit?: number;
}
