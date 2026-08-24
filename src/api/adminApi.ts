import apiClient from './apiClient';
import { BookingFilters } from '../types/booking';
import { HaircutFormPayload, OfferFormPayload } from '../types/service';

// --- Auth & Profile ---
export const login = (email: string, password: string) =>
  apiClient.post('/admin/auth/login', { email, password });

export const getProfile = () => apiClient.get('/admin/profile');

export const updateProfile = (payload: { name?: string; phone?: string; profileImage?: string }) =>
  apiClient.patch('/admin/profile', payload);

export const changePassword = (currentPassword: string, newPassword: string) =>
  apiClient.post('/admin/change-password', { currentPassword, newPassword });

export const logout = (refreshToken: string) => apiClient.post('/admin/logout', { refreshToken });

// --- Dashboard ---
export const getDashboardAnalytics = () => apiClient.get('/admin/dashboard/analytics');

// --- Bookings ---
export const getBookings = (filters: BookingFilters = {}) =>
  apiClient.get('/admin/bookings', { params: filters });

export const getBookingById = (id: string) => apiClient.get(`/admin/bookings/${id}`);

export const updateBookingStatus = (id: string, status: string, note?: string) =>
  apiClient.patch(`/admin/bookings/${id}/status`, { status, note });

// --- Haircuts ---
export const getHaircuts = (params: { search?: string; isActive?: boolean } = {}) =>
  apiClient.get('/admin/haircuts', { params });

export const createHaircut = (payload: HaircutFormPayload) => apiClient.post('/admin/haircuts', payload);

export const updateHaircut = (id: string, payload: Partial<HaircutFormPayload>) =>
  apiClient.patch(`/admin/haircuts/${id}`, payload);

export const deleteHaircut = (id: string) => apiClient.delete(`/admin/haircuts/${id}`);

// --- Offers ---
export const getOffers = (params: { isActive?: boolean } = {}) =>
  apiClient.get('/admin/offers', { params });

export const createOffer = (payload: OfferFormPayload) => apiClient.post('/admin/offers', payload);

export const updateOffer = (id: string, payload: Partial<OfferFormPayload>) =>
  apiClient.patch(`/admin/offers/${id}`, payload);

export const deleteOffer = (id: string) => apiClient.delete(`/admin/offers/${id}`);

// --- Carousel Banners ---
export const getCarousels = () => apiClient.get('/admin/carousels');

export const createCarousel = (payload: Record<string, any>) => apiClient.post('/admin/carousels', payload);

export const updateCarousel = (id: string, payload: Record<string, any>) =>
  apiClient.patch(`/admin/carousels/${id}`, payload);

export const deleteCarousel = (id: string) => apiClient.delete(`/admin/carousels/${id}`);

// --- Users ---
export const getUsers = (params: { search?: string; isBlocked?: boolean; page?: number; limit?: number } = {}) =>
  apiClient.get('/admin/users', { params });

export const getUserDetails = (id: string) => apiClient.get(`/admin/users/${id}`);

export const toggleUserBlock = (id: string) => apiClient.patch(`/admin/users/${id}/toggle-block`);

// --- Availability ---
export const getAvailability = () => apiClient.get('/admin/availability');

export const updateAvailability = (payload: Record<string, any>) => apiClient.put('/admin/availability', payload);

// --- Reviews ---
export const getReviews = (params: Record<string, any> = {}) => apiClient.get('/admin/reviews', { params });

export const getReviewStats = () => apiClient.get('/admin/reviews/stats');

export const toggleReviewVisibility = (id: string) => apiClient.patch(`/admin/reviews/${id}/toggle-visibility`);

export const deleteReview = (id: string) => apiClient.delete(`/admin/reviews/${id}`);

// --- Notifications ---
export const getNotifications = (params: Record<string, any> = {}) =>
  apiClient.get('/admin/notifications', { params });

export const markNotificationRead = (id: string) => apiClient.patch(`/admin/notifications/${id}/read`);

export const markAllNotificationsRead = () => apiClient.patch('/admin/notifications/read-all');

export default {
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  getDashboardAnalytics,
  getBookings,
  getBookingById,
  updateBookingStatus,
  getHaircuts,
  createHaircut,
  updateHaircut,
  deleteHaircut,
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  getCarousels,
  createCarousel,
  updateCarousel,
  deleteCarousel,
  getUsers,
  getUserDetails,
  toggleUserBlock,
  getAvailability,
  updateAvailability,
  getReviews,
  getReviewStats,
  toggleReviewVisibility,
  deleteReview,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
