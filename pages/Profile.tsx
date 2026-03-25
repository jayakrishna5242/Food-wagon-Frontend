import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAddresses } from '../context/AddressContext';
import { useToast } from '../context/ToastContext';
import { useFavorites } from '../context/FavoritesContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchOrders } from '../services/api';
import { Order } from '../types';
import AddressForm from '../components/AddressForm';
import RestaurantCard from '../components/RestaurantCard';
import { 
  LogOut, 
  User as UserIcon, 
  MapPin, 
  Settings, 
  ShoppingBag, 
  CreditCard, 
  Heart, 
  Home, 
  Briefcase,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Plus,
  Utensils,
  ChevronRight,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'orders' | 'profile' | 'addresses' | 'payments' | 'favorites';

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'profile', label: 'Settings', icon: Settings },
];

const Profile: React.FC = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { addresses, addAddress, removeAddress } = useAddresses();
  const { favorites } = useFavorites();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    if (activeTab !== 'orders') return;

    const loadOrders = async () => {
      setLoadingOrders(true);
      try {
        const data = await fetchOrders();
        const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setOrders(sorted);
      } catch (error) {
        console.error('Failed to fetch orders');
      } finally {
        setLoadingOrders(false);
      }
    };

    loadOrders();
  }, [user, navigate, activeTab, authLoading]);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully. See you soon!', 'info');
    navigate('/');
  };

  const handleRemoveAddress = (id: string) => {
    removeAddress(id);
    showToast('Address removed successfully.', 'info');
  };

  const handleTabChange = (tabId: Tab) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  if (!user) return null;

  useEffect(() => {
    const tab = searchParams.get('tab') as Tab;
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#35728a] py-8 md:py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        
        <div className="flex justify-between items-center mb-8 text-white px-2">
           <div>
             <h1 className="text-3xl font-bold">My Account</h1>
             <p className="text-sm opacity-80 mt-1">{user.name} • {user.email}</p>
           </div>
           <button 
             onClick={handleLogout}
             className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors text-white"
             title="Logout"
           >
             <LogOut className="w-5 h-5" />
           </button>
        </div>

        <div className="bg-white min-h-[600px] shadow-2xl overflow-hidden rounded-2xl flex flex-col">
          
          {/* Desktop Tab Navigation - Hidden on Mobile */}
          <div className="hidden md:block border-b border-gray-100 p-6 bg-gray-50/50">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 overflow-hidden ${
                    activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 relative z-10 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                  <span className="relative z-10">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="active-tab-bg"
                      className="absolute inset-0 bg-primary"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-6 md:p-12 overflow-y-auto max-h-[800px] bg-white no-scrollbar">
            
            {activeTab === 'orders' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-2xl font-extrabold text-dark mb-8">Past Orders</h2>
                
                {loadingOrders ? (
                  <div className="space-y-4">
                     {[1,2,3].map(i => (
                       <div key={i} className="h-40 bg-gray-100 rounded-lg animate-pulse"></div>
                     ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-20">
                     <div className="w-48 h-48 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                        <ShoppingBag className="w-20 h-20 text-gray-200" />
                     </div>
                     <p className="text-gray-500 font-medium">No orders found.</p>
                     <button onClick={() => navigate('/')} className="mt-4 text-primary font-bold hover:underline">
                        Order food now
                     </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 p-4 md:p-6 rounded-md hover:shadow-lg transition-all bg-white group border-l-4 hover:border-l-primary">
                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-3 md:gap-4 mb-3 md:mb-4 border-b border-gray-100 pb-3 md:pb-4">
                          <div className="flex items-start gap-3 md:gap-4">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100 group-hover:shadow-md transition-all">
                               {order.restaurantImageUrl || (order.items && order.items[0]?.imageUrl) ? (
                                 <img src={order.restaurantImageUrl || order.items[0].imageUrl} alt="Restaurant" className="w-full h-full object-cover" />
                               ) : (
                                 <div className="bg-primary/5 w-full h-full flex items-center justify-center">
                                    <Utensils className="w-6 h-6 md:w-8 md:h-8 text-primary/30" />
                                 </div>
                               )}
                            </div>
                            <div>
                               <h3 className="font-bold text-sm md:text-lg text-dark group-hover:text-primary transition-colors">{order.restaurantName || "The Sizzling Grill"}</h3>
                               <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-gray-500 mt-0.5">
                                 <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-400" />
                                 <span className="truncate max-w-[150px] md:max-w-none">{order.deliveryAddress || "FoodWagon Hub Location"}</span>
                               </div>
                               <div className="flex items-center gap-2 md:gap-3 mt-1.5 md:mt-2">
                                  <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                     ORDER #{order.id}
                                  </p>
                                  <span className="w-0.5 h-0.5 md:w-1 md:h-1 bg-gray-300 rounded-full"></span>
                                  <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                     <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" /> {new Date(order.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                               </div>
                            </div>
                          </div>
                          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start">
                             <div className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-wider ${
                               order.status === 'DELIVERED' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600 animate-pulse'
                             }`}>
                               <span>{order.status}</span>
                               <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                             </div>
                          </div>
                        </div>

                        <div className="mb-4 md:mb-6">
                           <div className="space-y-1.5 md:space-y-2">
                             {order.items && order.items.map((item, idx) => (
                               <div key={idx} className="flex justify-between items-center text-xs md:text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${item.isVeg !== false ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                    <span className="text-gray-700 font-medium">
                                       {item.name} <span className="text-gray-400 font-black text-[10px] md:text-xs ml-1">x{item.quantity}</span>
                                    </span>
                                  </div>
                                  <span className="text-gray-500 text-[10px] md:text-xs font-bold">₹{item.price * item.quantity}</span>
                               </div>
                             ))}
                           </div>
                        </div>

                        <div className="flex flex-row justify-between items-center pt-3 md:pt-4 border-t border-dashed border-gray-200 gap-2 md:gap-4">
                           <div className="flex flex-col">
                              <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount Paid</span>
                              <span className="font-black text-dark text-base md:text-lg">₹{order.totalAmount}</span>
                           </div>
                           
                           <div className="flex gap-2 md:gap-3">
                             <button 
                               onClick={() => {
                                 const rid = order.restaurantId || (order.items && order.items[0]?.restaurantId);
                                 if (rid) navigate(`/restaurant/${rid}`);
                                 else navigate('/search');
                               }} 
                               className="px-3 md:px-6 py-2 md:py-2.5 bg-gray-900 text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-1.5 md:gap-2 rounded-lg"
                             >
                               View Menu <ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3" />
                             </button>
                             <button className="px-3 md:px-6 py-2 md:py-2.5 border border-gray-200 text-gray-600 text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all rounded-lg">
                               Help
                             </button>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-2xl font-extrabold text-dark mb-8">Favorite Restaurants</h2>
                {favorites.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="bg-gray-50 p-6 rounded-full mb-4">
                      <Heart className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="font-bold text-lg text-dark">No favorites yet</h3>
                    <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
                      Explore your favorite restaurants and tap the heart to save them here.
                    </p>
                    <button onClick={() => navigate('/')} className="mt-6 bg-primary text-white font-bold py-3 px-8 rounded-md shadow-lg hover:bg-[#e26e10] transition-colors uppercase text-sm">Browse Restaurants</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {favorites.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-extrabold text-dark">Manage Addresses</h2>
                  <button onClick={() => setIsAddressModalOpen(true)} className="text-primary font-bold text-sm hover:underline flex items-center gap-1"><Plus className="w-4 h-4" /> ADD NEW</button>
                </div>
                {addresses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="bg-gray-50 p-6 rounded-full mb-4"><MapPin className="w-10 h-10 text-gray-300" /></div>
                      <h3 className="font-bold text-lg text-dark">No addresses found</h3>
                      <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">Add an address to make checkout faster.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="border border-gray-200 p-6 rounded-md group hover:border-primary transition-all relative">
                        <div className="flex items-start gap-4">
                          <div className="mt-1">
                            {addr.type === 'Home' && <Home className="w-5 h-5 text-gray-400 group-hover:text-primary" />}
                            {addr.type === 'Work' && <Briefcase className="w-5 h-5 text-gray-400 group-hover:text-primary" />}
                            {addr.type === 'Other' && <MapPin className="w-5 h-5 text-gray-400 group-hover:text-primary" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-dark mb-1">{addr.type}</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">{addr.flatNo}, {addr.area}, {addr.city}</p>
                            <div className="mt-4 flex gap-4">
                               <button onClick={() => handleRemoveAddress(addr.id)} className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 uppercase tracking-wider"><Trash2 className="w-3 h-3" /> Delete</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-2xl font-extrabold text-dark mb-2">Edit Profile</h2>
                <p className="text-gray-500 text-sm mb-8">Update your personal details here.</p>
                <div className="max-w-md space-y-6">
                   <div className="border border-gray-300 px-4 py-3 bg-white focus-within:border-black transition-colors">
                      <label className="block text-xs text-gray-400 mb-1">Name</label>
                      <input type="text" defaultValue={user.name} className="w-full outline-none text-dark font-medium" />
                   </div>
                   <div className="border border-gray-300 px-4 py-3 bg-white focus-within:border-black transition-colors">
                      <label className="block text-xs text-gray-400 mb-1">Email</label>
                      <input type="email" defaultValue={user.email} className="w-full outline-none text-dark font-medium" disabled />
                   </div>
                   <div className="border border-gray-300 px-4 py-3 bg-white focus-within:border-black transition-colors">
                      <label className="block text-xs text-gray-400 mb-1">Phone Number</label>
                      <input type="tel" defaultValue="9876543210" className="w-full outline-none text-dark font-medium" />
                   </div>
                   <button className="bg-primary text-white font-bold py-3 px-8 uppercase text-sm shadow hover:bg-[#e26e10] transition-colors">Update</button>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
               <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                  <div className="bg-gray-50 p-6 rounded-full mb-4"><CreditCard className="w-10 h-10 text-gray-300" /></div>
                  <h3 className="font-bold text-lg text-dark">No payments found</h3>
                  <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">You haven't added any payment methods yet.</p>
               </div>
            )}
          </div>
        </div>
      </div>

      <AddressForm isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} onSave={(newAddr) => {
          addAddress(newAddr);
          showToast(`Address "${newAddr.type}" added successfully.`, "success");
          setIsAddressModalOpen(false);
      }} />
    </div>
  );
};

export default Profile;