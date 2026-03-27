// Partner API functions
import { AuthResponse, Restaurant, User } from '../../types';
import { getUsersDB, getRestaurantsDB, saveRestaurantsDB, saveUsersDB } from '../../services/api';

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
