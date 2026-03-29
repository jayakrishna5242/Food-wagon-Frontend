
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'PARTNER' | 'ADMIN' | 'DELIVERY';
  restaurantId?: number; // For partners
  isVerified?: boolean;
  isNew?: boolean;
  rating?: number;
  ratingCount?: number;
  vehicleType?: string;
  vehicleNumber?: string;
  drivingLicense?: string;
}

export interface UserAddress {
  id: string;
  type: 'Home' | 'Work' | 'Other';
  flatNo: string;
  area: string;
  city: string;
}

export interface AuthResponse {
  user: User;
}

export interface Restaurant {
  id: number;
  name: string;
  imageUrl: string;
  rating: number;
  ratingCount?: number;
  deliveryTime: string;
  costForTwo: string;
  cuisines: string[];
  location: string;
  city: string;
  latitude?: number;
  longitude?: number;
  fssaiLicense?: string;
  isNew?: boolean;
  isPureVeg?: boolean;
  isVerified?: boolean;
  isOffline?: boolean;
  operatingHours?: string;
  aggregatedDiscountInfo?: {
    header: string;
    subHeader: string;
  };
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isVeg: boolean;
  category: string;
  restaurantId: number;
  restaurantName?: string;
  inStock?: boolean;
  rating?: number;
  ratingCount?: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: number;
  userId?: number;
  items: CartItem[];
  totalAmount: number;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
  date: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  restaurantName?: string;
  restaurantId?: number;
  restaurantAddress?: string;
  restaurantImageUrl?: string;
  rating?: number;
  review?: string;
  deliveryBoyId?: number;
  deliveryBoyName?: string;
  appliedOffer?: string;
}

export interface Trip {
  id: number;
  orderId: number;
  restaurantName: string;
  restaurantAddress: string;
  deliveryAddress: string;
  customerName: string;
  payout: number;
  basePay: number;
  tips: number;
  deductions: number;
  distance: number;
  date: string;
  status: 'COMPLETED' | 'CANCELLED';
  rating?: number;
  feedback?: string;
}

export interface EarningsSummary {
  daily: number;
  weekly: number;
  monthly: number;
  totalTrips: number;
  totalTips: number;
  totalDeductions: number;
}

export interface OrderRequest {
  id: number;
  orderId: number;
  restaurantName: string;
  restaurantAddress: string;
  deliveryAddress: string;
  payout: number;
  distance: number;
  expiresAt: number; // Timestamp in ms
}

export interface Offer {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  restaurantId?: number; // Optional: if undefined, it's a global offer
}

export interface GenieBooking {
  id: number;
  userId: number;
  type: 'pickup' | 'buy';
  pickupLocation: string;
  dropLocation: string;
  itemDescription: string;
  date: string;
  status: 'PENDING' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED';
}
