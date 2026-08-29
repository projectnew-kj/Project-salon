export interface Haircut {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
}

export interface Offer {
  _id: string;
  title: string;
  description: string;
  image: string;
  originalPrice: number;
  offerPrice: number;
  discountPercentage: number;
  services: Haircut[] | string[];
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

export interface Banner {
  _id: string;
  title: string;
  description?: string;
  images: string[];
  /** Legacy API compatibility. New responses should use images. */
  image?: string;
  ctaAction?: string;
  ctaTargetId?: string;
  displayOrder?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string | null;
}

export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'
  | 'Rejected';

export interface StatusHistoryEntry {
  status: BookingStatus;
  note: string;
  timestamp: string;
}

export interface Booking {
  _id: string;
  bookingCode: string;
  itemType: 'HAIRCUT' | 'OFFER_PACKAGE';
  haircut?: Haircut;
  offer?: Offer;
  bookingDate: string;
  bookingTime: string;
  durationMinutes: number;
  totalAmount: number;
  status: BookingStatus;
  statusHistory: StatusHistoryEntry[];
  notes: string;
  isReviewed: boolean;
  createdAt: string;
}

export interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  isDefault: boolean;
}
