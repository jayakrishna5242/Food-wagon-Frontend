import { Restaurant, MenuItem, Order, AuthResponse, User, Offer, Trip, EarningsSummary, OrderRequest, GenieBooking, Task, CartItem, SupermarketItem, FreshStore, FreshStoreCategory } from '../types';
import { apiClient } from './apiClient';

/* =====================================================
   LOCAL STORAGE HELPERS (Session Management)
 ===================================================== */

const USER_KEY = 'foodwagon_user';
const TOKEN_KEY = 'foodwagon_token';

export const storeUser = (user: User) => {
  if (!user) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const storeToken = (token: string) => {
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = (): User | null => {
  const data = localStorage.getItem(USER_KEY);
  if (!data || data === 'undefined' || data === 'null') return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
};

export const clearStoredUser = () => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

/* =====================================================
   AUTH (Backend Integration)
 ===================================================== */

export const loginUser = async (identifier: string, password: string): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', { identifier, password });
  if (response.user) {
    storeUser(response.user);
  }
  if (response.token) {
    storeToken(response.token);
  }
  return response;
};

export const registerUser = async (fullName: string, email: string, phone: string, password: string): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/register', { name: fullName, email, phone, password, role: 'CUSTOMER' });
  if (response.user) {
    storeUser(response.user);
  }
  if (response.token) {
    storeToken(response.token);
  }
  return response;
};

export const updateUser = async (userId: number, updates: Partial<User>): Promise<User> => {
  const updatedUser = await apiClient.put(`/users/${userId}`, updates);
  
  // Also update stored user if it's the current one
  const current = getStoredUser();
  if (current && current.id === userId) {
    storeUser(updatedUser);
  }
  
  return updatedUser;
};

export const generateOtp = async (email: string): Promise<{ message: string }> => {
  return apiClient.post('/auth/forgot-password/generate-otp', { email });
};

export const resetPassword = async (email: string, otp: string, newPassword: string): Promise<{ message: string }> => {
  return apiClient.post('/auth/forgot-password/reset', { email, otp, newPassword });
};

/* =====================================================
   CATALOG (Backend Integration)
 ===================================================== */

export const fetchRestaurants = async (city?: string, includeUnverified: boolean = false): Promise<Restaurant[]> => {
  const params = new URLSearchParams();
  if (city) params.append('city', city);
  if (includeUnverified) params.append('includeUnverified', 'true');
  
  const queryString = params.toString();
  return apiClient.get(`/restaurants${queryString ? `?${queryString}` : ''}`);
};

export const fetchMenu = async (restaurantId: number): Promise<MenuItem[]> => {
  return apiClient.get(`/restaurants/${restaurantId}/menu`);
};

export const searchGlobal = async (query: string): Promise<{ restaurants: Restaurant[]; items: MenuItem[] }> => {
  return apiClient.get(`/restaurants/search?q=${encodeURIComponent(query)}`);
};

export const toggleRestaurantStatus = async (id: number): Promise<boolean> => {
  return apiClient.patch(`/restaurants/${id}/toggle`);
};

export const fetchOffers = async (restaurantId?: number): Promise<Offer[]> => {
  const url = restaurantId ? `/offers?restaurantId=${restaurantId}` : '/offers';
  return apiClient.get(url);
};

export const addOffer = async (offer: Partial<Offer>): Promise<Offer> => {
  return apiClient.post('/offers', offer);
};

export const deleteOffer = async (id: string): Promise<void> => {
  return apiClient.delete(`/offers/${id}`);
};

export const fetchRestaurantById = async (id: number): Promise<Restaurant | null> => {
  return apiClient.get(`/restaurants/${id}`);
};

/* =====================================================
   ORDERS (Backend Integration)
 ===================================================== */

export const placeOrder = async (orderData: any): Promise<Order> => {
  return apiClient.post('/orders', orderData);
};

export const fetchOrders = async (userId?: number): Promise<Order[]> => {
  if (userId) {
    return apiClient.get(`/orders/user/${userId}`);
  }
  return apiClient.get('/orders');
};

export const cancelOrder = async (orderId: number): Promise<void> => {
  return updateOrderStatus(orderId, 'CANCELLED');
};

export const updateOrderStatus = async (orderId: number, status: string, deliveryBoyId?: number, deliveryBoyName?: string): Promise<any> => {
  return apiClient.patch(`/orders/${orderId}/status`, { status, deliveryBoyId, deliveryBoyName });
};

/* =====================================================
   GENIE (Backend Integration)
  ===================================================== */

export const placeGenieBooking = async (bookingData: Partial<GenieBooking>): Promise<GenieBooking> => {
  return apiClient.post('/genie', bookingData);
};

export const fetchGenieBookings = async (userId?: number, riderId?: number): Promise<GenieBooking[]> => {
  if (userId) {
    return apiClient.get(`/genie/user/${userId}`);
  }
  if (riderId) {
    return apiClient.get(`/genie/rider/${riderId}`);
  }
  return apiClient.get('/genie');
};

export const fetchGenieBookingById = async (id: number): Promise<GenieBooking> => {
  return apiClient.get(`/genie/${id}`);
};

export const updateGenieStatus = async (id: number, status: string, riderId?: number): Promise<GenieBooking> => {
  return apiClient.patch(`/genie/${id}/status`, { status, riderId });
};

export const acceptGenieBooking = async (id: number, riderId: number): Promise<GenieBooking> => {
  return apiClient.patch(`/genie/${id}/accept`, { riderId });
};

export const cancelGenieBooking = async (bookingId: number): Promise<void> => {
  return apiClient.delete(`/genie/${bookingId}`);
};

/* =====================================================
   EARNINGS & TRIPS (Backend Integration)
 ===================================================== */

export const fetchEarningsSummary = async (deliveryBoyId: number): Promise<EarningsSummary> => {
  return apiClient.get(`/delivery/earnings/${deliveryBoyId}`);
};

export const fetchTrips = async (deliveryBoyId: number, startDate?: string, endDate?: string): Promise<Trip[]> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const queryString = params.toString();
  return apiClient.get(`/delivery/trips/${deliveryBoyId}${queryString ? `?${queryString}` : ''}`);
};

export const fetchOrderRequests = async (deliveryBoyId: number): Promise<OrderRequest[]> => {
  return apiClient.get(`/delivery/requests/${deliveryBoyId}`);
};

export const acceptOrderRequest = async (requestId: number, deliveryBoyId: number): Promise<void> => {
  return apiClient.post(`/delivery/requests/${requestId}/accept`, { deliveryBoyId });
};

export const rejectOrderRequest = async (requestId: number, deliveryBoyId: number): Promise<void> => {
  return apiClient.post(`/delivery/requests/${requestId}/reject`, { deliveryBoyId });
};

/* =====================================================
   CART & CHECKOUT (Local Storage)
 ===================================================== */

const CART_KEY = 'foodwagon_cart';
const COUPON_KEY = 'foodwagon_coupon';
const DISCOUNT_KEY = 'foodwagon_discount';

export const fetchCart = async (): Promise<CartItem[]> => {
  const data = localStorage.getItem(CART_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const saveCart = async (items: CartItem[]): Promise<void> => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

export const fetchAppliedCoupon = async (): Promise<string | null> => {
  return localStorage.getItem(COUPON_KEY);
};

export const saveAppliedCoupon = async (coupon: string | null): Promise<void> => {
  if (coupon) {
    localStorage.setItem(COUPON_KEY, coupon);
  } else {
    localStorage.removeItem(COUPON_KEY);
  }
};

export const fetchCartDiscount = async (): Promise<number> => {
  const data = localStorage.getItem(DISCOUNT_KEY);
  return data ? Number(data) : 0;
};

export const saveCartDiscount = async (discount: number): Promise<void> => {
  localStorage.setItem(DISCOUNT_KEY, discount.toString());
};

/* =====================================================
   PARTNER & DELIVERY (Backend Integration)
 ===================================================== */

export const fetchAllUsers = async (): Promise<User[]> => {
  return apiClient.get('/admin/users');
};

export const verifyRestaurant = async (restaurantId: number): Promise<void> => {
  return apiClient.post(`/admin/restaurants/${restaurantId}/verify`, {});
};

export const verifyUser = async (userId: number): Promise<void> => {
  return apiClient.post(`/admin/users/${userId}/verify`, {});
};

export const fetchPartnerRestaurant = async (restaurantId: number): Promise<Restaurant | null> => {
  return apiClient.get(`/partner/restaurants/${restaurantId}`);
};

export const updateRestaurantDetails = async (id: number, details: Partial<Restaurant>): Promise<Restaurant> => {
  return apiClient.put(`/partner/restaurants/${id}`, details);
};

export const addMenuItem = async (item: Partial<MenuItem>): Promise<MenuItem> => {
  return apiClient.post('/partner/menu-items', item);
};

export const updateMenuItem = async (id: number, details: Partial<MenuItem>): Promise<MenuItem> => {
  return apiClient.put(`/partner/menu-items/${id}`, details);
};

export const deleteMenuItem = async (id: number): Promise<void> => {
  return apiClient.delete(`/partner/menu-items/${id}`);
};

export const toggleStock = async (itemId: number): Promise<boolean> => {
  return apiClient.patch(`/partner/menu-items/${itemId}/toggle-stock`);
};

export const registerPartner = async (partnerData: any): Promise<AuthResponse> => {
  return apiClient.post('/auth/register/partner', partnerData);
};

export const registerDelivery = async (riderData: any): Promise<AuthResponse> => {
  return apiClient.post('/auth/register/rider', riderData);
};

/* =====================================================
   RATINGS (Backend Integration)
 ===================================================== */

export const rateOrder = async (
  orderId: number, 
  rating: number, 
  review?: string, 
  riderRating?: number,
  itemRatings?: Record<number, number>
): Promise<void> => {
  return apiClient.post(`/orders/${orderId}/rate`, { rating, review, riderRating, itemRatings });
};

/* =====================================================
   TASKS (Backend Integration)
 ===================================================== */

export const fetchTasks = async (): Promise<Task[]> => {
  return apiClient.get('/tasks');
};

export const fetchTaskById = async (id: string): Promise<Task | null> => {
  return apiClient.get(`/tasks/${id}`);
};

export const createTask = async (taskData: Partial<Task>): Promise<Task> => {
  return apiClient.post('/tasks', taskData);
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
  return apiClient.put(`/tasks/${id}`, updates);
};

export const deleteTask = async (id: string): Promise<void> => {
  return apiClient.delete(`/tasks/${id}`);
};

/* =====================================================
   ADDRESSES & FAVORITES (Backend Integration)
 ===================================================== */

const ADDRESS_KEY = 'foodwagon_addresses';

export const fetchAddresses = async (): Promise<any[]> => {
  const data = localStorage.getItem(ADDRESS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const saveAddress = async (address: any): Promise<any> => {
  const current = await fetchAddresses();
  const newAddress = {
    ...address,
    id: address.id || Date.now().toString()
  };
  const updated = [...current, newAddress];
  localStorage.setItem(ADDRESS_KEY, JSON.stringify(updated));
  return newAddress;
};

export const removeAddress = async (id: string): Promise<void> => {
  const current = await fetchAddresses();
  const updated = current.filter((a: any) => a.id !== id);
  localStorage.setItem(ADDRESS_KEY, JSON.stringify(updated));
};

const FAVORITES_KEY = 'foodwagon_favorites';

export const fetchFavorites = async (): Promise<Restaurant[]> => {
  const data = localStorage.getItem(FAVORITES_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const toggleFavorite = async (restaurant: Restaurant): Promise<Restaurant[]> => {
  const current = await fetchFavorites();
  const exists = current.find((r) => r.id === restaurant.id);
  let updated: Restaurant[];
  if (exists) {
    updated = current.filter((r) => r.id !== restaurant.id);
  } else {
    updated = [...current, restaurant];
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return updated;
};

/* =====================================================
   FEAST MART & FRESH STORES (Backend Integration)
 ===================================================== */

export const fetchFeastMartCategories = async (): Promise<string[]> => {
  return apiClient.get('/supermarket/categories');
};

export const fetchFeastMartItems = async (category: string | null = null, query: string = ''): Promise<SupermarketItem[]> => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (query) params.append('query', query);
  return apiClient.get(`/supermarket/items?${params.toString()}`);
};

export const fetchFreshStoreCategories = async (): Promise<FreshStoreCategory[]> => {
  return apiClient.get('/fresh-stores/categories');
};

export const fetchFreshStores = async (category: string | null = null): Promise<FreshStore[]> => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  const queryString = params.toString();
  return apiClient.get(`/fresh-stores${queryString ? `?${queryString}` : ''}`);
};

export const clearAllData = () => {
  localStorage.clear();
  window.location.reload();
};

/* =====================================================
   SEARCH & HISTORY (Backend Integration)
 ===================================================== */

export const fetchRecentSearches = async (): Promise<string[]> => {
  return apiClient.get('/search/recent');
};

export const saveRecentSearchToDB = async (searchTerm: string): Promise<void> => {
  return apiClient.post('/search/recent', { searchTerm });
};

export const removeSearchFromDB = async (searchTerm: string): Promise<void> => {
  return apiClient.delete(`/search/recent/${encodeURIComponent(searchTerm)}`);
};

export const clearSearchHistoryInDB = async (): Promise<void> => {
  return apiClient.delete('/search/recent');
};

import { Utensils, Store, ShoppingBag, Bike } from 'lucide-react';

export const fetchHomeCategories = async (): Promise<any[]> => {
  // These are UI categories, maybe can still be hardcoded or fetched
  return [
    {
      id: 'food',
      title: 'Food',
      subtitle: 'UP TO 20% OFF',
      icon: Utensils,
      image: 'https://picsum.photos/seed/food-delivery/800/800',
      link: '/restaurants',
      gradient: 'from-orange-600/90 to-red-700/90',
      actionText: 'ORDER NOW'
    },
    {
      id: 'stores',
      title: 'Stores',
      subtitle: 'CLEAN & FRESH',
      icon: Store,
      image: 'https://picsum.photos/seed/fresh-grocery/800/800',
      link: '/fresh-stores',
      gradient: 'from-emerald-600/90 to-teal-700/90',
      actionText: 'SHOP NOW'
    },
    {
      id: 'mart',
      title: 'Mart',
      subtitle: 'GROCERY DELIVERY',
      icon: ShoppingBag,
      image: 'https://picsum.photos/seed/mart-shopping/800/800',
      link: '/supermarket',
      gradient: 'from-blue-600/90 to-indigo-700/90',
      actionText: 'ORDER NOW'
    },
    {
      id: 'genie',
      title: 'Genie',
      subtitle: 'SEND & RECEIVE',
      icon: Bike,
      image: 'https://picsum.photos/seed/delivery-bike/800/800',
      link: '/delivery-service',
      gradient: 'from-pink-600/90 to-rose-700/90',
      actionText: 'BOOK NOW'
    }
  ];
};

/* =====================================================
   LOCATION (Backend Integration)
 ===================================================== */

export const fetchLocationFromDB = async (): Promise<{ city: string; address: string; coordinates?: { latitude: number; longitude: number } } | null> => {
  return apiClient.get('/location');
};

export const saveLocationToDB = async (city: string, address: string, coordinates?: { latitude: number; longitude: number } | null): Promise<void> => {
  return apiClient.post('/location', { city, address, coordinates });
};

/* =====================================================
   HELPERS
 ===================================================== */

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Number(d.toFixed(1));
};

export const calculateDeliveryTime = (distance: number | null): string => {
  if (distance !== null) {
    const minutes = Math.round((distance / 20) * 60) + 10;
    return `${minutes} mins`;
  }
  return '30-40 mins';
};

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
