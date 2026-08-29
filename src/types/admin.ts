export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  role: string;
}

export interface DashboardMetrics {
  totalBookings: number;
  todayBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalRevenue: number;
}

export interface AppUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  preferredLanguage: string;
  themePreference: 'light' | 'dark' | 'system';
  isActive: boolean;
  isBlocked: boolean;
  createdAt: string;
}

export interface CarouselBanner {
  _id: string;
  title: string;
  description: string;
  image: string;
  ctaAction: string;
  ctaTargetId: string;
  displayOrder: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
}

export interface AdminNotification {
  _id: string;
  title: string;
  body: string;
  type: 'BOOKING' | 'OFFER' | 'HAIRCUT' | 'SYSTEM' | 'REMINDER';
  data: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  totalPages: number;
}

export interface OperatingBreak {
  startTime: string;
  endTime: string;
  label?: string;
}

export interface WeeklyDaySchedule {
  day: string;
  isOpen: boolean;
  scheduleType: string;
  slots: Array<{ startTime: string; endTime: string; slotDurationMinutes?: number; maxConcurrentBookings?: number }>;
  breaks: OperatingBreak[];
}
