
import { Restaurant, MenuItem, Order, AuthResponse, User, Offer, Trip, EarningsSummary, OrderRequest } from '../types';
import { MOCK_OFFERS } from '../mockData';

/* =====================================================
   LOCAL STORAGE HELPERS
 ===================================================== */

const USER_KEY = 'foodwagon_user';
const USERS_DB_KEY = 'foodwagon_users_db_v4';
const ORDERS_DB_KEY = 'foodwagon_orders_db_v4';
const RESTAURANTS_DB_KEY = 'foodwagon_restaurants_db_v4';
const MENU_ITEMS_DB_KEY = 'foodwagon_menu_items_db_v4';
const OFFERS_DB_KEY = 'foodwagon_offers_db_v4';
const TRIPS_DB_KEY = 'foodwagon_trips_db_v4';
const ORDER_REQUESTS_DB_KEY = 'foodwagon_order_requests_db_v4';

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
  if (!data) {
    const initial: User[] = [
      { id: 1, name: 'Admin User', email: 'admin@foodwagon.com', phone: '9999999999', role: 'ADMIN', isVerified: true }
    ];
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
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

const getRestaurantsDB = (): Restaurant[] => {
  const data = localStorage.getItem(RESTAURANTS_DB_KEY);
  return data ? JSON.parse(data) : [];
};

const saveRestaurantsDB = (restaurants: Restaurant[]) => {
  localStorage.setItem(RESTAURANTS_DB_KEY, JSON.stringify(restaurants));
};

const getMenuItemsDB = (): MenuItem[] => {
  const data = localStorage.getItem(MENU_ITEMS_DB_KEY);
  return data ? JSON.parse(data) : [];
};

const saveMenuItemsDB = (items: MenuItem[]) => {
  localStorage.setItem(MENU_ITEMS_DB_KEY, JSON.stringify(items));
};

const getOffersDB = (): Offer[] => {
  const data = localStorage.getItem(OFFERS_DB_KEY);
  if (!data) {
    localStorage.setItem(OFFERS_DB_KEY, JSON.stringify(MOCK_OFFERS));
    return MOCK_OFFERS;
  }
  return JSON.parse(data);
};

const saveOffersDB = (offers: Offer[]) => {
  localStorage.setItem(OFFERS_DB_KEY, JSON.stringify(offers));
};

const getTripsDB = (): Trip[] => {
  const data = localStorage.getItem(TRIPS_DB_KEY);
  return data ? JSON.parse(data) : [];
};

const saveTripsDB = (trips: Trip[]) => {
  localStorage.setItem(TRIPS_DB_KEY, JSON.stringify(trips));
};

const getOrderRequestsDB = (): OrderRequest[] => {
  const data = localStorage.getItem(ORDER_REQUESTS_DB_KEY);
  return data ? JSON.parse(data) : [];
};

const saveOrderRequestsDB = (requests: OrderRequest[]) => {
  localStorage.setItem(ORDER_REQUESTS_DB_KEY, JSON.stringify(requests));
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

  // In this mock, we accept 'admin123' for admin@foodwagon.com, and anything for others
  if (user.email === 'admin@foodwagon.com' && password !== 'admin123') {
    throw new Error('Invalid admin password.');
  }

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
    role: 'CUSTOMER',
    isVerified: true
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
   CATALOG (Local Storage Mock)
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

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export const fetchRestaurants = async (city?: string, includeUnverified: boolean = false): Promise<Restaurant[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const restaurants = getRestaurantsDB();
  let result = restaurants;
  
  // Only show verified restaurants to customers unless explicitly requested
  if (!includeUnverified) {
    result = result.filter(r => r.isVerified);
  }
  
  if (city) {
    return result.filter(r => r.city.toLowerCase() === city.toLowerCase());
  }
  return result;
};

export const fetchMenu = async (restaurantId: number): Promise<MenuItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const items = getMenuItemsDB();
  return items.filter(item => item.restaurantId === restaurantId);
};

export const searchGlobal = async (query: string): Promise<{ restaurants: Restaurant[]; items: MenuItem[] }> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  const q = query.toLowerCase();
  const restaurants = getRestaurantsDB();
  const items = getMenuItemsDB();
  return {
    restaurants: restaurants.filter(r => 
      r.name.toLowerCase().includes(q) || 
      r.cuisines.some(c => c.toLowerCase().includes(q))
    ),
    items: items.filter(item => 
      item.name.toLowerCase().includes(q) || 
      item.description.toLowerCase().includes(q)
    )
  };
};

export const fetchOffers = async (restaurantId?: number): Promise<Offer[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const offers = getOffersDB();
  if (restaurantId) {
    // Return global offers + restaurant specific offers
    return offers.filter(o => !o.restaurantId || o.restaurantId === restaurantId);
  }
  return offers.filter(o => !o.restaurantId);
};

export const addOffer = async (offer: Partial<Offer>): Promise<Offer> => {
  const offers = getOffersDB();
  const newOffer: Offer = {
    id: Date.now().toString(),
    code: offer.code || '',
    description: offer.description || '',
    discountType: offer.discountType || 'PERCENTAGE',
    discountValue: offer.discountValue || 0,
    minOrderValue: offer.minOrderValue || 0,
    restaurantId: offer.restaurantId
  };
  offers.push(newOffer);
  saveOffersDB(offers);
  return newOffer;
};

export const deleteOffer = async (id: string): Promise<void> => {
  const offers = getOffersDB();
  const updated = offers.filter(o => o.id !== id);
  saveOffersDB(updated);
};

/* =====================================================
   ORDERS (Local Storage Mock)
 ===================================================== */

export const placeOrder = async (orderData: any): Promise<Order> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  const user = getStoredUser();
  const orders = getOrdersDB();

  const restaurants = getRestaurantsDB();
  const restaurant = restaurants.find(r => r.id === orderData.restaurantId);

  const newOrder: Order = {
    id: Date.now(),
    userId: user?.id,
    items: orderData.items,
    totalAmount: orderData.totalAmount,
    status: 'PENDING',
    date: new Date().toISOString(),
    customerName: user?.name || 'Guest',
    customerPhone: user?.phone,
    deliveryAddress: orderData.deliveryAddress,
    restaurantName: orderData.restaurantName,
    restaurantId: orderData.restaurantId,
    restaurantAddress: restaurant ? `${restaurant.location}, ${restaurant.city}` : 'Restaurant Address',
    restaurantImageUrl: restaurant?.imageUrl
  };

  orders.push(newOrder);
  saveOrdersDB(orders);
  return newOrder;
};

export const fetchOrders = async (): Promise<Order[]> => {
  const user = getStoredUser();
  if (!user) return [];
  const orders = getOrdersDB();
  
  if (user.role === 'ADMIN') {
    return orders.sort((a, b) => b.id - a.id);
  }
  
  if (user.role === 'PARTNER') {
    return orders.filter(o => o.restaurantId === user.restaurantId).sort((a, b) => b.id - a.id);
  }
  
  if (user.role === 'DELIVERY') {
    // Delivery boys see orders that are READY (and not yet assigned) or assigned to them
    return orders.filter(o => o.deliveryBoyId === user.id || (o.status === 'READY' && !o.deliveryBoyId)).sort((a, b) => b.id - a.id);
  }

  return orders.filter(o => o.userId === user.id).sort((a, b) => b.id - a.id);
};

export const updateOrderStatus = async (orderId: number, status: Order['status'], deliveryBoyId?: number, deliveryBoyName?: string): Promise<void> => {
  const orders = getOrdersDB();
  const updated = orders.map(o => {
    if (o.id === orderId) {
      const updatedOrder = { ...o, status };
      if (deliveryBoyId) updatedOrder.deliveryBoyId = deliveryBoyId;
      if (deliveryBoyName) updatedOrder.deliveryBoyName = deliveryBoyName;
      
      // If delivered, create a trip record
      if (status === 'DELIVERED' && deliveryBoyId) {
        const trips = getTripsDB();
        const basePay = 40;
        const tips = Math.random() > 0.5 ? 20 : 0;
        const deductions = 5;
        const newTrip: Trip = {
          id: Date.now(),
          orderId: o.id,
          restaurantName: o.restaurantName || 'Unknown',
          restaurantAddress: o.restaurantAddress || 'Restaurant Address',
          deliveryAddress: o.deliveryAddress || 'Customer Address',
          customerName: o.customerName || 'Customer',
          payout: basePay + tips - deductions,
          basePay,
          tips,
          deductions,
          distance: 5.0, // Fixed mock distance
          date: new Date().toISOString(),
          status: 'COMPLETED'
        };
        trips.push(newTrip);
        saveTripsDB(trips);
      }
      
      return updatedOrder;
    }
    return o;
  });
  saveOrdersDB(updated);
};

/* =====================================================
   EARNINGS & TRIPS (Mock)
 ===================================================== */

export const fetchEarningsSummary = async (deliveryBoyId: number): Promise<EarningsSummary> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const trips = getTripsDB();
  
  const today = new Date().toDateString();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const daily = trips.filter(t => new Date(t.date).toDateString() === today)
    .reduce((acc, t) => acc + (t.payout || 0), 0);
    
  const weekly = trips.filter(t => new Date(t.date) >= sevenDaysAgo)
    .reduce((acc, t) => acc + (t.payout || 0), 0);
    
  const totalTips = trips.reduce((acc, t) => acc + (t.tips || 0), 0);
  const totalDeductions = trips.reduce((acc, t) => acc + (t.deductions || 0), 0);
  const totalPayout = trips.reduce((acc, t) => acc + (t.payout || 0), 0);
  
  return {
    daily,
    weekly,
    monthly: totalPayout,
    totalTrips: trips.length,
    totalTips,
    totalDeductions
  };
};

export const fetchTrips = async (deliveryBoyId: number, startDate?: string, endDate?: string): Promise<Trip[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  let trips = getTripsDB();
  
  if (startDate) {
    trips = trips.filter(t => new Date(t.date) >= new Date(startDate));
  }
  if (endDate) {
    trips = trips.filter(t => new Date(t.date) <= new Date(endDate));
  }
  
  // For demo, if no trips, add some
  if (trips.length === 0 && !startDate && !endDate) {
    const initialTrips: Trip[] = [
      {
        id: 1,
        orderId: 101,
        restaurantName: 'Burger King',
        restaurantAddress: 'Indiranagar, Bangalore',
        deliveryAddress: 'HSR Layout, Bangalore',
        customerName: 'John Doe',
        payout: 45,
        basePay: 40,
        tips: 10,
        deductions: 5,
        distance: 4.2,
        date: new Date().toISOString(),
        status: 'COMPLETED'
      },
      {
        id: 2,
        orderId: 102,
        restaurantName: 'Pizza Hut',
        restaurantAddress: 'Koramangala, Bangalore',
        deliveryAddress: 'BTM Layout, Bangalore',
        customerName: 'Jane Smith',
        payout: 38,
        basePay: 35,
        tips: 5,
        deductions: 2,
        distance: 3.5,
        date: new Date(Date.now() - 86400000).toISOString(),
        status: 'COMPLETED'
      }
    ];
    saveTripsDB(initialTrips);
    return initialTrips;
  }
  return trips.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const fetchOrderRequests = async (deliveryBoyId: number): Promise<OrderRequest[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const requests = getOrderRequestsDB();
  
  // Only return non-expired requests
  const activeRequests = requests.filter(r => r.expiresAt > Date.now());
  
  // If no requests, occasionally generate a mock one (for demo purposes)
  // but don't do it every single time if we just cleared them
  if (activeRequests.length === 0) {
    const lastGen = localStorage.getItem('last_request_gen');
    const now = Date.now();
    
    if (!lastGen || now - parseInt(lastGen) > 60000) { // Only every 60 seconds
      const mockRequest: OrderRequest = {
        id: now,
        orderId: 201 + Math.floor(Math.random() * 100),
        restaurantName: 'Taco Bell',
        restaurantAddress: 'MG Road, Bangalore',
        deliveryAddress: 'Whitefield, Bangalore',
        payout: 120,
        distance: 12.5,
        expiresAt: now + 30000
      };
      localStorage.setItem('last_request_gen', now.toString());
      return [mockRequest];
    }
    return [];
  }
  
  return activeRequests;
};

export const acceptOrderRequest = async (requestId: number, deliveryBoyId: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const requests = getOrderRequestsDB();
  const request = requests.find(r => r.id === requestId);
  
  if (request) {
    const orders = getOrdersDB();
    const updatedOrders = orders.map(o => {
      if (o.id === request.orderId) {
        const newStatus: Order['status'] = o.status === 'PENDING' || o.status === 'PREPARING' ? o.status : 'DISPATCHED';
        return { ...o, deliveryBoyId, status: newStatus };
      }
      return o;
    });
    saveOrdersDB(updatedOrders);
  }
  
  const updated = requests.filter(r => r.id !== requestId);
  saveOrderRequestsDB(updated);
};

export const rejectOrderRequest = async (requestId: number, deliveryBoyId: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const requests = getOrderRequestsDB();
  const updated = requests.filter(r => r.id !== requestId);
  saveOrderRequestsDB(updated);
};

/* =====================================================
   PARTNER & DELIVERY (Mock)
 ===================================================== */

export const registerPartner = async (payload: any): Promise<AuthResponse> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const users = getUsersDB();
  const restaurants = getRestaurantsDB();
  
  const newRestaurant: Restaurant = {
    id: Date.now(),
    name: payload.restaurantName,
    imageUrl: payload.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop',
    rating: 0,
    ratingCount: 0,
    deliveryTime: '30-40 mins',
    costForTwo: '₹500 for two',
    cuisines: payload.cuisines || ['Indian'],
    location: payload.location,
    city: payload.city,
    latitude: payload.latitude,
    longitude: payload.longitude,
    fssaiLicense: payload.fssaiLicense,
    isNew: true,
    isVerified: false
  };
  
  restaurants.push(newRestaurant);
  saveRestaurantsDB(restaurants);

  const newUser: User = {
    id: Date.now() + 1,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    role: 'PARTNER',
    restaurantId: newRestaurant.id,
    isVerified: false,
    isNew: true
  };

  users.push(newUser);
  saveUsersDB(users);

  return { user: newUser };
};

export const registerDelivery = async (payload: any): Promise<AuthResponse> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const users = getUsersDB();
  
  const newUser: User = {
    id: Date.now(),
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    role: 'DELIVERY',
    isVerified: false,
    isNew: true,
    rating: 0,
    ratingCount: 0,
    vehicleType: payload.vehicleType,
    vehicleNumber: payload.vehicleNumber,
    drivingLicense: payload.drivingLicense
  };

  users.push(newUser);
  saveUsersDB(users);

  return { user: newUser };
};

export const fetchAllUsers = async (): Promise<User[]> => {
  return getUsersDB();
};

export const verifyRestaurant = async (restaurantId: number): Promise<void> => {
  const restaurants = getRestaurantsDB();
  const updatedRestaurants = restaurants.map(r => 
    r.id === restaurantId ? { ...r, isVerified: true } : r
  );
  saveRestaurantsDB(updatedRestaurants);

  // Also verify the partner user associated with this restaurant
  const users = getUsersDB();
  const updatedUsers = users.map(u => 
    u.restaurantId === restaurantId ? { ...u, isVerified: true } : u
  );
  saveUsersDB(updatedUsers);
};

export const verifyUser = async (userId: number): Promise<void> => {
  const users = getUsersDB();
  const restaurants = getRestaurantsDB();
  
  const user = users.find(u => u.id === userId);
  if (user && user.restaurantId) {
    const updatedRestaurants = restaurants.map(r => 
      r.id === user.restaurantId ? { ...r, isVerified: true } : r
    );
    saveRestaurantsDB(updatedRestaurants);
  }

  const updatedUsers = users.map(u => u.id === userId ? { ...u, isVerified: true } : u);
  saveUsersDB(updatedUsers);
};

export const fetchPartnerRestaurant = async (restaurantId: number): Promise<Restaurant | null> => {
  const restaurants = getRestaurantsDB();
  return restaurants.find(r => r.id === restaurantId) || null;
};

export const updateRestaurantDetails = async (id: number, details: Partial<Restaurant>): Promise<Restaurant> => {
  const restaurants = getRestaurantsDB();
  let updatedRestaurant: Restaurant | null = null;
  const updated = restaurants.map(r => {
    if (r.id === id) {
      updatedRestaurant = { ...r, ...details };
      return updatedRestaurant;
    }
    return r;
  });
  saveRestaurantsDB(updated);
  if (!updatedRestaurant) throw new Error('Restaurant not found');
  return updatedRestaurant;
};

export const addMenuItem = async (item: Partial<MenuItem>): Promise<MenuItem> => {
  const items = getMenuItemsDB();
  const newItem: MenuItem = {
    id: Date.now(),
    name: item.name || '',
    description: item.description || '',
    price: item.price || 0,
    imageUrl: item.imageUrl || '',
    isVeg: item.isVeg || false,
    category: item.category || '',
    restaurantId: item.restaurantId || 0,
    inStock: true,
    rating: 0,
    ratingCount: 0
  };
  items.push(newItem);
  saveMenuItemsDB(items);
  return newItem;
};

export const updateMenuItem = async (id: number, details: Partial<MenuItem>): Promise<MenuItem> => {
  const items = getMenuItemsDB();
  let updatedItem: MenuItem | null = null;
  const updated = items.map(i => {
    if (i.id === id) {
      updatedItem = { ...i, ...details };
      return updatedItem;
    }
    return i;
  });
  if (!updatedItem) throw new Error('Item not found');
  saveMenuItemsDB(updated);
  return updatedItem;
};

export const deleteMenuItem = async (id: number): Promise<void> => {
  const items = getMenuItemsDB();
  const updated = items.filter(i => i.id !== id);
  saveMenuItemsDB(updated);
};

export const toggleStock = async (itemId: number): Promise<void> => {
  const items = getMenuItemsDB();
  const updated = items.map(i => i.id === itemId ? { ...i, inStock: !i.inStock } : i);
  saveMenuItemsDB(updated);
};

/* =====================================================
   RATINGS (Local Storage Mock)
 ===================================================== */

export const rateOrder = async (
  orderId: number, 
  rating: number, 
  review?: string, 
  riderRating?: number,
  itemRatings?: Record<number, number>
): Promise<void> => {
  const orders = getOrdersDB();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  // 1. Update Order Rating
  const updatedOrders = orders.map(o => o.id === orderId ? { ...o, rating, review } : o);
  saveOrdersDB(updatedOrders);

  // 2. Update Restaurant Rating
  if (order.restaurantId) {
    const restaurants = getRestaurantsDB();
    const updatedRestaurants = restaurants.map(r => {
      if (r.id === order.restaurantId) {
        const currentCount = r.ratingCount || 0;
        const currentRating = r.rating || 0;
        const newCount = currentCount + 1;
        const newRating = Number(((currentRating * currentCount + rating) / newCount).toFixed(1));
        return { ...r, rating: newRating, ratingCount: newCount };
      }
      return r;
    });
    saveRestaurantsDB(updatedRestaurants);
  }

  // 3. Update Menu Items Rating
  if (order.items && order.items.length > 0) {
    const menuItems = getMenuItemsDB();
    const updatedMenuItems = menuItems.map(item => {
      const orderedItem = order.items.find(oi => oi.id === item.id);
      if (orderedItem) {
        const currentCount = item.ratingCount || 0;
        const currentRating = item.rating || 0;
        const newCount = currentCount + 1;
        const specificItemRating = itemRatings?.[item.id] || rating;
        const newRating = Number(((currentRating * currentCount + specificItemRating) / newCount).toFixed(1));
        return { ...item, rating: newRating, ratingCount: newCount };
      }
      return item;
    });
    saveMenuItemsDB(updatedMenuItems);
  }

  // 4. Update Rider Rating
  if (order.deliveryBoyId) {
    const users = getUsersDB();
    const updatedUsers = users.map(u => {
      if (u.id === order.deliveryBoyId) {
        const currentCount = u.ratingCount || 0;
        const currentRating = u.rating || 0;
        const newCount = currentCount + 1;
        const finalRiderRating = riderRating || rating;
        const newRating = Number(((currentRating * currentCount + finalRiderRating) / newCount).toFixed(1));
        return { ...u, rating: newRating, ratingCount: newCount };
      }
      return u;
    });
    saveUsersDB(updatedUsers);

    // 5. Update Trip Rating
    const trips = getTripsDB();
    const updatedTrips = trips.map(t => {
      if (t.orderId === orderId) {
        return { ...t, rating: riderRating || rating, feedback: review };
      }
      return t;
    });
    saveTripsDB(updatedTrips);
  }
};
