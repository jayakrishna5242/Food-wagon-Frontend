
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: 'CUSTOMER' | 'PARTNER';
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
  deliveryTime: string;
  costForTwo: string;
  cuisines: string[];
  location: string;
  city: string;
  isNew?: boolean;
  isPureVeg?: boolean;
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
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: number;
  userId?: number;
  items: CartItem[];
  totalAmount: number;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'DISPATCHED' | 'DELIVERED';
  date: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  restaurantName?: string;
  restaurantId?: number;
  restaurantImageUrl?: string;
}

export interface Offer {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
}
