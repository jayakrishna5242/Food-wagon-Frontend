
import { Restaurant, MenuItem, Order, AuthResponse, User, Offer } from '../types';
import { MOCK_RESTAURANTS, MOCK_MENU_ITEMS, MOCK_OFFERS } from '../mockData';

/* =====================================================
   LOCAL STORAGE HELPERS
 ===================================================== */

const USER_KEY = 'foodwagon_user';
const USERS_DB_KEY = 'foodwagon_users_db';
const ORDERS_DB_KEY = 'foodwagon_orders_db';

export const storeUser = (user: User) => {
  if (!user) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
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
};

const getUsersDB = (): User[] => {
  const data = localStorage.getItem(USERS_DB_KEY);
  return data ? JSON.parse(data) : [];
};

const saveUsersDB = (users: User[]) => {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
};

const getOrdersDB = (): Order[] => {
  const data = localStorage.getItem(ORDERS_DB_KEY);
  return data ? JSON.parse(data) : [];
};

const saveOrdersDB = (orders: Order[]) => {
  localStorage.setItem(ORDERS_DB_KEY, JSON.stringify(orders));
};

/* =====================================================
   AUTH (Local Storage Mock)
   ===================================================== */

export const loginUser = async (identifier: string, password: string): Promise<AuthResponse> => {
  // Mock delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const users = getUsersDB();
  const user = users.find(u => u.email === identifier || u.phone === identifier);

  if (!user) {
    throw new Error('User not found. Please register.');
  }

  // In a real mock, we'd check password too, but for simplicity:
  storeUser(user);
  return { user };
};

export const registerUser = async (fullName: string, email: string, phone: string, password: string): Promise<AuthResponse> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const users = getUsersDB();
  if (users.some(u => u.email === email)) {
    throw new Error('Email already registered.');
  }

  const newUser: User = {
    id: Date.now(),
    name: fullName,
    email,
    phone,
    role: 'CUSTOMER'
  };

  users.push(newUser);
  saveUsersDB(users);
  storeUser(newUser);

  return { user: newUser };
};

export const generateOtp = async (email: string): Promise<{ message: string }> => {
  return { message: 'OTP sent to your email (Mock)' };
};

export const resetPassword = async (email: string, otp: string, newPassword: string): Promise<{ message: string }> => {
  return { message: 'Password reset successfully (Mock)' };
};

/* =====================================================
   CATALOG (Mock Data)
 ===================================================== */

export const fetchRestaurants = async (city?: string): Promise<Restaurant[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  if (city) {
    return MOCK_RESTAURANTS.filter(r => r.city.toLowerCase() === city.toLowerCase());
  }
  return MOCK_RESTAURANTS;
};

export const fetchMenu = async (restaurantId: number): Promise<MenuItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return MOCK_MENU_ITEMS.filter(item => item.restaurantId === restaurantId);
};

export const searchGlobal = async (query: string): Promise<{ restaurants: Restaurant[]; items: MenuItem[] }> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  const q = query.toLowerCase();
  return {
    restaurants: MOCK_RESTAURANTS.filter(r => 
      r.name.toLowerCase().includes(q) || 
      r.cuisines.some(c => c.toLowerCase().includes(q))
    ),
    items: MOCK_MENU_ITEMS.filter(item => 
      item.name.toLowerCase().includes(q) || 
      item.description.toLowerCase().includes(q)
    )
  };
};

export const fetchOffers = async (): Promise<Offer[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_OFFERS;
};

/* =====================================================
   ORDERS (Local Storage Mock)
 ===================================================== */

export const placeOrder = async (orderData: any): Promise<Order> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  const user = getStoredUser();
  const orders = getOrdersDB();

  const newOrder: Order = {
    id: Date.now(),
    userId: user?.id,
    items: orderData.items,
    totalAmount: orderData.totalAmount,
    status: 'PENDING',
    date: new Date().toISOString(),
    customerName: user?.name || 'Guest',
    deliveryAddress: orderData.deliveryAddress,
    restaurantName: orderData.restaurantName,
    restaurantId: orderData.restaurantId
  };

  orders.push(newOrder);
  saveOrdersDB(orders);
  return newOrder;
};

export const fetchOrders = async (): Promise<Order[]> => {
  const user = getStoredUser();
  if (!user) return [];
  const orders = getOrdersDB();
  return orders.filter(o => o.userId === user.id).sort((a, b) => b.id - a.id);
};

/* =====================================================
   PARTNER (Mock)
 ===================================================== */

export const loginPartner = async (email: string, password: string): Promise<AuthResponse> => {
  return loginUser(email, password);
};

export const registerPartner = async (payload: any): Promise<AuthResponse> => {
  return registerUser(payload.name, payload.email, payload.phone, payload.password);
};

// Partner Dashboard Functions
export const fetchPartnerOrders = async (): Promise<Order[]> => {
  const orders = localStorage.getItem(ORDERS_DB_KEY);
  return orders ? JSON.parse(orders) : [];
};

export const fetchPartnerRestaurant = async (partnerId: number): Promise<Restaurant | null> => {
  // For mock, we'll just return the first restaurant
  return MOCK_RESTAURANTS[0];
};

export const updateRestaurantDetails = async (id: number, details: Partial<Restaurant>): Promise<Restaurant> => {
  return { ...MOCK_RESTAURANTS[0], ...details };
};

export const addMenuItem = async (item: Partial<MenuItem>): Promise<MenuItem> => {
  const newItem: MenuItem = {
    id: Math.floor(Math.random() * 10000),
    name: item.name || '',
    description: item.description || '',
    price: item.price || 0,
    imageUrl: item.imageUrl || '',
    isVeg: item.isVeg || false,
    category: item.category || '',
    restaurantId: item.restaurantId || 0,
    inStock: true
  };
  return newItem;
};

export const updateOrderStatus = async (orderId: number, status: Order['status']): Promise<void> => {
  const orders = await fetchPartnerOrders();
  const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
  localStorage.setItem(ORDERS_DB_KEY, JSON.stringify(updated));
};

export const toggleStock = async (itemId: number): Promise<void> => {
  // Mock success
  return;
};
