// Rider API functions
import { AuthResponse, User } from '../../types';
import { getUsersDB, saveUsersDB } from '../../services/api';

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
